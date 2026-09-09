import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
    raw.includes('osama') ||
    raw.includes('waseem') ||
    raw.includes('super_admin') ||
    raw.includes('admin')
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

async function startWhatsAppSocketForUser(cleanUserId) {
  const session = userSessions.get(cleanUserId);
  if (!session || session.isStarting) return;

  session.isStarting = true;
  session.status = 'connecting';

  try {
    const { state, saveCreds } = await useMultiFileAuthState(session.authDir);

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
        session.status = 'qr_ready';
        try {
          session.qr = await QRCode.toDataURL(qr, {
            margin: 1,
            scale: 7,
            color: { dark: '#111827', light: '#ffffff' }
          });
          console.log(`[WhatsApp Gateway] 📱 New Live QR Code ready for user: ${cleanUserId}`);
        } catch (err) {
          console.error(`[WhatsApp Gateway] Failed to convert QR for ${cleanUserId}:`, err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        session.status = 'disconnected';
        session.qr = null;
        session.isStarting = false;

        console.log(`[WhatsApp Gateway] User '${cleanUserId}' connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(() => {
            startWhatsAppSocketForUser(cleanUserId);
          }, 4000);
        } else {
          console.log(`[WhatsApp Gateway] User '${cleanUserId}' logged out. Cleaning session files...`);
          try {
            fs.rmSync(session.authDir, { recursive: true, force: true });
          } catch (e) {}
          setTimeout(() => {
            startWhatsAppSocketForUser(cleanUserId);
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
      }
    });
  } catch (err) {
    console.error(`[WhatsApp Gateway] Error starting socket for user '${cleanUserId}':`, err);
    session.isStarting = false;
    session.status = 'disconnected';
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
  if (session) {
    try {
      if (session.sock) await session.sock.logout();
    } catch (e) {}
    try {
      fs.rmSync(session.authDir, { recursive: true, force: true });
    } catch (e) {}
    session.status = 'disconnected';
    session.qr = null;
    session.phone = null;
    session.name = null;
    session.isStarting = false;
    setTimeout(() => startWhatsAppSocketForUser(cleanId), 1500);
  }
  return { success: true, message: `Logged out session for user ${cleanId}` };
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
});
