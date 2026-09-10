import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBosnwK5ima8AFANYoBxfzPN9mb-yNwVnQ",
  authDomain: "ostan-75a0c.firebaseapp.com",
  projectId: "ostan-75a0c",
  storageBucket: "ostan-75a0c.firebasestorage.app",
  messagingSenderId: "278978199753",
  appId: "1:278978199753:web:e32452e1c4b39f41970d18"
};

const fbApp = initializeApp(firebaseConfig);
const fbDb = getFirestore(fbApp);

const PORT = process.env.WHATSAPP_PORT || 5001;
// Bind to 0.0.0.0 so the gateway is reachable from any device on the same network (LAN)
const HOST = process.env.WHATSAPP_HOST || '0.0.0.0';
const BASE_SESSIONS_DIR = path.join(process.cwd(), 'whatsapp_sessions');

/** Get all non-loopback IPv4 addresses for this machine */
function getLanIPs() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

/** Sync live session state directly to Cloud Firestore so each user has their own separate number and QR */
async function syncSessionStateToFirestore(cleanUserId, session) {
  try {
    const isConnected = (session.status === 'connected' || Boolean(session.phone)) && session.status !== 'disconnected';
    const data = {
      userId: cleanUserId,
      status: session.status,
      qr: session.qr || null,
      phone: session.phone || null,
      name: session.name || null,
      connected: isConnected,
      lanIPs: getLanIPs(),
      gatewayPort: PORT,
      updatedAt: Date.now()
    };
    // 1. Separate number and QR stored per user
    const userDocRef = doc(fbDb, 'whatsappSessions', cleanUserId);
    await setDoc(userDocRef, data, { merge: true });

    // 2. Legacy global fallback for u-osama
    if (cleanUserId === 'u-osama') {
      const liveRef = doc(fbDb, 'systemSettings', 'whatsapp_live');
      await setDoc(liveRef, data, { merge: true });
    }
    console.log(`[WhatsApp Gateway] ☁️ Synced live state for user '${cleanUserId}' to Cloud Firestore (Status: ${session.status}, Phone: ${session.phone || 'none'})`);
  } catch (err) {
    console.warn(`[WhatsApp Gateway] Firestore live state sync notice for '${cleanUserId}':`, err?.message || err);
  }
}

// Ensure base sessions directory exists
if (!fs.existsSync(BASE_SESSIONS_DIR)) {
  fs.mkdirSync(BASE_SESSIONS_DIR, { recursive: true });
}

// Preserve existing legacy single session for Osama if needed
const LEGACY_DIR = path.join(process.cwd(), 'whatsapp_session');
const OSAMA_DIR = path.join(BASE_SESSIONS_DIR, 'user_u-osama');
if (fs.existsSync(LEGACY_DIR) && !fs.existsSync(OSAMA_DIR)) {
  try {
    fs.cpSync(LEGACY_DIR, OSAMA_DIR, { recursive: true });
    console.log('[WhatsApp Gateway] Preserved active session for user u-osama');
  } catch (e) {
    console.warn('[WhatsApp Gateway] Migration note:', e);
  }
}

// Multi-User Session Store: cleanUserId -> sessionObject
const userSessions = new Map();

function sanitizeUserId(id) {
  if (!id) return 'guest';
  const raw = String(id).trim().toLowerCase();
  if (
    raw === 'u-osama' ||
    raw === 'gtc0y8aj1ne4uzdf4fjdcuowkpf1' ||
    raw === 'osama' ||
    raw === 'waseem'
  ) {
    return 'u-osama';
  }
  return raw.replace(/[^a-z0-9_-]/g, '_') || 'guest';
}

function getUserAuthDir(cleanId) {
  const dir = path.join(BASE_SESSIONS_DIR, `user_${cleanId}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getOrCreateUserSession(rawUserId) {
  const cleanId = sanitizeUserId(rawUserId);
  if (userSessions.has(cleanId)) {
    return userSessions.get(cleanId);
  }

  const sessionObj = {
    userId: cleanId,
    status: 'disconnected', // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
    qr: null,
    phone: null,
    name: null,
    sock: null,
    isStarting: false,
    authDir: getUserAuthDir(cleanId)
  };

  userSessions.set(cleanId, sessionObj);
  startWhatsAppSocketForUser(cleanId);
  return sessionObj;
}

async function startWhatsAppSocketForUser(cleanUserId, forceRestart = false) {
  let session = userSessions.get(cleanUserId);
  if (!session) {
    session = {
      userId: cleanUserId,
      status: 'disconnected',
      qr: null,
      phone: null,
      name: null,
      sock: null,
      isStarting: false,
      authDir: getUserAuthDir(cleanUserId)
    };
    userSessions.set(cleanUserId, session);
  }

  if (session.isStarting && !forceRestart) return;

  if (forceRestart && session.sock) {
    try { session.sock.end(); } catch (e) {}
    session.sock = null;
  }

  session.isStarting = true;
  if (forceRestart) {
    session.qr = null;
    session.phone = null;
  }
  session.status = session.phone ? 'connected' : (session.qr ? 'qr_ready' : 'connecting');
  syncSessionStateToFirestore(cleanUserId, session);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(session.authDir);

    // If already paired from saved credentials on disk, restore identity immediately
    if (state.creds?.me?.id) {
      const id = state.creds.me.id;
      session.phone = id.split(':')[0] || id.split('@')[0];
      session.name = state.creds.me.name || `User ${cleanUserId}`;
      session.status = 'connecting';
      console.log(`[WhatsApp Gateway] 📱 Restored saved pairing credentials for '${cleanUserId}' (Phone: +${session.phone})`);
      syncSessionStateToFirestore(cleanUserId, session);
    }

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: [`Ostan ERP (${cleanUserId})`, 'Chrome', '124.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
    });

    session.sock = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // If user already has authenticated credentials, do not let transient QR wipe the linked state
        if (session.phone && sock?.user?.id) {
          console.log(`[WhatsApp Gateway] User '${cleanUserId}' already paired (+${session.phone}), ignoring transient QR`);
        } else {
          session.status = 'qr_ready';
          session.phone = null;
          try {
            session.qr = await QRCode.toDataURL(qr, {
              margin: 1,
              scale: 7,
              color: { dark: '#111827', light: '#ffffff' }
            });
            console.log(`[WhatsApp Gateway] 📱 New Live QR Code ready for user: ${cleanUserId}`);
            syncSessionStateToFirestore(cleanUserId, session);
          } catch (err) {
            console.error(`[WhatsApp Gateway] Failed to convert QR for ${cleanUserId}:`, err);
          }
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const shouldReconnect = !isLoggedOut;

        console.log(`[WhatsApp Gateway] User '${cleanUserId}' connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          // Socket closed transiently (e.g. code 408, 440, 515, keepalive). Keep phone and paired status intact!
          session.status = session.phone ? 'connected' : (session.qr ? 'qr_ready' : 'connecting');
          // Preserve session.qr so it doesn't flicker/vanish on remote screens while awaiting new QR
          session.isStarting = false;
          syncSessionStateToFirestore(cleanUserId, session);

          setTimeout(() => {
            startWhatsAppSocketForUser(cleanUserId);
          }, 2000);
        } else {
          console.log(`[WhatsApp Gateway] ⚠️ User '${cleanUserId}' was unpaired / logged out from mobile. Cleaning session files...`);
          session.status = 'disconnected';
          session.qr = null;
          session.phone = null;
          session.name = null;
          session.isStarting = false;
          try {
            fs.rmSync(session.authDir, { recursive: true, force: true });
          } catch (e) {}
          if (cleanUserId === 'u-osama') {
            try { fs.rmSync(LEGACY_DIR, { recursive: true, force: true }); } catch (e) {}
          }
          syncSessionStateToFirestore(cleanUserId, session);

          setTimeout(() => {
            startWhatsAppSocketForUser(cleanUserId, true);
          }, 1500);
        }
      } else if (connection === 'open') {
        session.status = 'connected';
        session.qr = null;
        session.isStarting = false;

        const id = sock?.user?.id || '';
        session.phone = id.split(':')[0] || id.split('@')[0];
        session.name = sock?.user?.name || `User ${cleanUserId}`;

        console.log(`\n======================================================`);
        console.log(`[WhatsApp Gateway] 🟢 User '${cleanUserId}' CONNECTED!`);
        console.log(`Active Phone: +${session.phone}`);
        console.log(`Account Name: ${session.name}`);
        console.log(`======================================================\n`);

        syncSessionStateToFirestore(cleanUserId, session);
      }
    });
  } catch (err) {
    console.error(`[WhatsApp Gateway] Error starting socket for user '${cleanUserId}':`, err);
    session.isStarting = false;
    session.status = session.phone ? 'connected' : 'disconnected';
    setTimeout(() => startWhatsAppSocketForUser(cleanUserId), 5000);
  }
}

async function sendWhatsAppMessageForUser(userId, targetPhone, messageText) {
  const session = getOrCreateUserSession(userId);
  if (session.status !== 'connected' || !session.sock) {
    throw new Error(`WhatsApp is not connected for user '${session.userId}'. Please scan the QR code first.`);
  }

  let cleanPhone = String(targetPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('05') && cleanPhone.length === 10) cleanPhone = '966' + cleanPhone.slice(1);
  else if (cleanPhone.startsWith('5') && cleanPhone.length === 9) cleanPhone = '966' + cleanPhone;

  const jid = `${cleanPhone}@s.whatsapp.net`;
  const result = await session.sock.sendMessage(jid, { text: messageText });
  return {
    success: true,
    senderPhone: session.phone,
    userId: session.userId,
    messageId: result?.key?.id || `msg-${Date.now()}`
  };
}

async function logoutWhatsAppForUser(userId) {
  const cleanId = sanitizeUserId(userId);
  const session = userSessions.get(cleanId);
  console.log(`[WhatsApp Gateway] 🔌 Logging out and unpairing session for ${cleanId}...`);

  if (session && session.sock) {
    try {
      const jid = session.sock.user?.id || session.sock.authState?.creds?.me?.id;
      if (jid) {
        console.log(`[WhatsApp Gateway] Sending remove-companion-device packet for ${jid} to WhatsApp servers...`);
        try {
          await session.sock.sendNode({
            tag: 'iq',
            attrs: {
              to: '@s.whatsapp.net',
              type: 'set',
              id: session.sock.generateMessageTag ? session.sock.generateMessageTag() : `${Date.now()}-logout`,
              xmlns: 'md'
            },
            content: [
              {
                tag: 'remove-companion-device',
                attrs: {
                  jid,
                  reason: 'user_initiated'
                }
              }
            ]
          });
          console.log(`[WhatsApp Gateway] ✅ remove-companion-device sent to WhatsApp! Mobile phone will unpair.`);
        } catch (nodeErr) {
          console.warn('[WhatsApp Gateway] sendNode unpair warning:', nodeErr?.message);
        }
      }

      await session.sock.logout('User logged out from web client');
      console.log(`[WhatsApp Gateway] ✅ Baileys sock.logout completed.`);
    } catch (e) {
      console.warn(`[WhatsApp Gateway] Logout notice for ${cleanId}:`, e?.message);
    }

    try { session.sock.end(); } catch (e) {}
    session.sock = null;
  }

  // Wait 700ms for network buffers to clear
  await new Promise(r => setTimeout(r, 700));

  if (session && session.authDir) {
    try {
      fs.rmSync(session.authDir, { recursive: true, force: true });
      console.log(`[WhatsApp Gateway] Cleared auth files for ${cleanId}`);
    } catch (e) {}
  }

  if (cleanId === 'u-osama') {
    try {
      fs.rmSync(LEGACY_DIR, { recursive: true, force: true });
      console.log(`[WhatsApp Gateway] Cleared legacy session dir for u-osama`);
    } catch (e) {}
  }

  if (session) {
    session.status = 'disconnected';
    session.qr = null;
    session.phone = null;
    session.name = null;
    session.isStarting = false;
    await syncSessionStateToFirestore(cleanId, session);
  }

  // Generate fresh QR code for this user so they can link again immediately
  setTimeout(() => {
    startWhatsAppSocketForUser(cleanId, true);
  }, 1200);

  return { success: true, message: `Logged out and unpaired session for user ${cleanId}` };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
};

// HTTP Server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    res.end(JSON.stringify(data));
  };

  // Helper to extract userId from headers or query param
  const getRequestedUserId = () => {
    return req.headers['x-user-id'] || url.searchParams.get('userId') || 'u-osama';
  };

  // 1. GET /api/status or /status
  if (req.method === 'GET' && (url.pathname === '/api/status' || url.pathname === '/status')) {
    const userId = getRequestedUserId();
    const session = getOrCreateUserSession(userId);
    return sendJSON(200, {
      success: true,
      userId: session.userId,
      status: session.status,
      qr: session.qr,
      phone: session.phone,
      name: session.name,
      timestamp: Date.now()
    });
  }

  // 2. POST /api/send or /send
  if (req.method === 'POST' && (url.pathname === '/api/send' || url.pathname === '/send')) {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const userId = body.userId || getRequestedUserId();
        const { phone, message } = body;

        if (!phone || !message) {
          return sendJSON(400, { success: false, error: 'Phone and message are required.' });
        }

        const result = await sendWhatsAppMessageForUser(userId, phone, message);
        return sendJSON(200, { success: true, ...result });
      } catch (error) {
        console.error('[WhatsApp Gateway] Send error:', error);
        return sendJSON(500, { success: false, error: error?.message || 'Failed to dispatch message' });
      }
    });
    return;
  }

  // 3. POST /api/logout or /logout
  if (req.method === 'POST' && (url.pathname === '/api/logout' || url.pathname === '/logout')) {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      const body = JSON.parse(bodyStr || '{}');
      const userId = body.userId || getRequestedUserId();
      const result = await logoutWhatsAppForUser(userId);
      return sendJSON(200, result);
    });
    return;
  }

  // 4. POST /api/restart
  if (req.method === 'POST' && url.pathname === '/api/restart') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      const body = JSON.parse(bodyStr || '{}');
      const userId = sanitizeUserId(body.userId || getRequestedUserId());
      const session = userSessions.get(userId);
      if (session) {
        session.isStarting = false;
        startWhatsAppSocketForUser(userId);
      }
      return sendJSON(200, { success: true, message: `Restarted session for ${userId}` });
    });
    return;
  }

  sendJSON(404, { success: false, error: 'Endpoint not found' });
});

server.listen(PORT, HOST, () => {
  const lanIPs = getLanIPs();
  console.log(`\n======================================================`);
  console.log(`⚡ Ostan Multi-User WhatsApp Gateway is RUNNING`);
  console.log(`------------------------------------------------------`);
  console.log(`🏠 Local access:  http://localhost:${PORT}`);
  if (lanIPs.length > 0) {
    lanIPs.forEach(ip => {
      console.log(`🌐 Network access: http://${ip}:${PORT}  ← Use this URL in Ostan app settings for remote users`);
    });
  } else {
    console.log(`🌐 Network access: (No LAN IP detected – check your network adapter)`);
  }
  console.log(`======================================================\n`);
  console.log(`💡 TIP: Copy the Network access URL above into the`);
  console.log(`   "Messages Sender" → "⚙️ WhatsApp API Config" → "Gateway URL" field`);
  console.log(`   so all remote users can reach the QR pairing engine.\n`);
  // Automatically start the default session
  getOrCreateUserSession('u-osama');

  // Real-time Cloud Outbox Listener for Remote Users
  try {
    onSnapshot(collection(fbDb, 'whatsappOutbox'), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const msgData = change.doc.data();
          const docId = change.doc.id;
          if (msgData && msgData.status === 'pending') {
            console.log(`[WhatsApp Gateway] 📨 Processing cloud outbox message for ${msgData.phone}...`);
            try {
              await updateDoc(doc(fbDb, 'whatsappOutbox', docId), { status: 'processing' });
              const res = await sendWhatsAppMessageForUser(msgData.userId || 'u-osama', msgData.phone, msgData.message);
              await updateDoc(doc(fbDb, 'whatsappOutbox', docId), {
                status: 'sent',
                sentAt: new Date().toISOString(),
                messageId: res.messageId
              });
              console.log(`[WhatsApp Gateway] ✅ Cloud outbox message sent to ${msgData.phone}!`);
            } catch (sendErr) {
              console.error(`[WhatsApp Gateway] ❌ Cloud outbox error for ${msgData.phone}:`, sendErr?.message || sendErr);
              await updateDoc(doc(fbDb, 'whatsappOutbox', docId), {
                status: 'failed',
                error: sendErr?.message || 'Failed to dispatch',
                failedAt: new Date().toISOString()
              });
            }
          }
        }
      });
    }, (err) => {
      console.warn('[WhatsApp Gateway] Outbox listener notice:', err?.message || err);
    });
    console.log('[WhatsApp Gateway] ☁️ Cloud Firestore Outbox Listener active');
  } catch (e) {
    console.warn('[WhatsApp Gateway] Could not attach Firestore outbox listener:', e);
  }

  // Real-time Cloud Requests Listener for Remote Users (e.g. Adel from outside localhost)
  try {
    onSnapshot(collection(fbDb, 'whatsappRequests'), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const reqData = change.doc.data();
          if (reqData && reqData.userId) {
            const cleanId = sanitizeUserId(reqData.userId);
            console.log(`[WhatsApp Gateway] ⚡ Cloud request received for user: ${cleanId} (action: ${reqData.action || 'request_qr'})`);
            const session = getOrCreateUserSession(cleanId);
            if (reqData.action === 'refresh' || reqData.action === 'restart') {
              await startWhatsAppSocketForUser(cleanId, true);
            } else if (reqData.action === 'logout' || reqData.action === 'disconnect') {
              await logoutWhatsAppForUser(cleanId);
            } else if (session.status === 'connected') {
              syncSessionStateToFirestore(cleanId, session);
            } else if (session.status === 'qr_ready' && session.qr) {
              syncSessionStateToFirestore(cleanId, session);
            } else if (session.status === 'disconnected' || !session.sock) {
              await startWhatsAppSocketForUser(cleanId, false);
            } else {
              // Socket already connecting: sync latest status to Firestore
              syncSessionStateToFirestore(cleanId, session);
            }
          }
        }
      });
    }, (err) => {
      console.warn('[WhatsApp Gateway] Requests listener notice:', err?.message || err);
    });
    console.log('[WhatsApp Gateway] ☁️ Cloud Firestore Requests Listener active');
  } catch (e) {
    console.warn('[WhatsApp Gateway] Could not attach Firestore requests listener:', e);
  }

  // Real-time Cloud Commands Listener for Remote Admin Actions (Refresh, Restart, Logout)
  let lastProcessedCmdTime = 0;
  try {
    onSnapshot(doc(fbDb, 'systemSettings', 'whatsapp_commands'), async (snap) => {
      if (snap && snap.exists()) {
        const cmd = snap.data();
        if (cmd && cmd.action && cmd.timestamp && (cmd.timestamp > lastProcessedCmdTime || Math.abs(Date.now() - cmd.timestamp) < 60000)) {
          lastProcessedCmdTime = cmd.timestamp;
          const cleanId = sanitizeUserId(cmd.userId || 'u-osama');
          console.log(`[WhatsApp Gateway] ⚡ Received remote command: ${cmd.action} for ${cleanId}`);
          if (cmd.action === 'restart' || cmd.action === 'refresh') {
            await startWhatsAppSocketForUser(cleanId, true);
          } else if (cmd.action === 'logout' || cmd.action === 'disconnect') {
            await logoutWhatsAppForUser(cleanId);
          }
        }
      }
    }, (err) => {
      console.warn('[WhatsApp Gateway] Commands listener notice:', err?.message || err);
    });
    console.log('[WhatsApp Gateway] ☁️ Cloud Firestore Remote Commands Listener active');
  } catch (e) {
    console.warn('[WhatsApp Gateway] Could not attach Firestore commands listener:', e);
  }
});

