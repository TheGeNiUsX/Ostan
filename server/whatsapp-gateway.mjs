import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.WHATSAPP_PORT || 5001;
const AUTH_DIR = path.join(process.cwd(), 'whatsapp_session');

// Ensure session directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let currentStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
let currentQR = null; // base64 Data URL (image/png)
let currentPhone = null;
let userName = null;
let sock = null;
let isStarting = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function startWhatsAppSocket() {
  if (isStarting) return;
  isStarting = true;
  currentStatus = 'connecting';

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      browser: ['Ostan System', 'Chrome', '124.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentStatus = 'qr_ready';
        try {
          currentQR = await QRCode.toDataURL(qr, {
            margin: 1,
            scale: 7,
            color: {
              dark: '#111827',
              light: '#ffffff'
            }
          });
          console.log('\n[WhatsApp Gateway] 📱 New Live QR Code ready for scanning!');
        } catch (err) {
          console.error('[WhatsApp Gateway] Failed to convert QR to image:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        currentStatus = 'disconnected';
        currentQR = null;
        isStarting = false;

        console.log(`[WhatsApp Gateway] ⚠️ Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(() => {
            startWhatsAppSocket();
          }, 4000);
        } else {
          console.log('[WhatsApp Gateway] 🔒 Session logged out. Resetting session store...');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
          setTimeout(() => {
            startWhatsAppSocket();
          }, 1500);
        }
      } else if (connection === 'open') {
        currentStatus = 'connected';
        currentQR = null;
        isStarting = false;

        const id = sock?.user?.id || '';
        currentPhone = id.split(':')[0] || id.split('@')[0];
        userName = sock?.user?.name || 'Ostan Administrator';

        console.log(`\n======================================================`);
        console.log(`[WhatsApp Gateway] 🟢 CONNECTED TO WHATSAPP!`);
        console.log(`Active Phone: +${currentPhone}`);
        console.log(`Account Name: ${userName}`);
        console.log(`======================================================\n`);
      }
    });
  } catch (err) {
    console.error('[WhatsApp Gateway] Error initializing socket:', err);
    isStarting = false;
    currentStatus = 'disconnected';
    setTimeout(() => startWhatsAppSocket(), 5000);
  }
}

async function sendWhatsAppMessage(targetPhone, messageText) {
  if (currentStatus !== 'connected' || !sock) {
    throw new Error('WhatsApp is not connected. Please scan the QR code first.');
  }

  let cleanPhone = String(targetPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('05') && cleanPhone.length === 10) cleanPhone = '966' + cleanPhone.slice(1);
  else if (cleanPhone.startsWith('5') && cleanPhone.length === 9) cleanPhone = '966' + cleanPhone;

  const jid = `${cleanPhone}@s.whatsapp.net`;
  const result = await sock.sendMessage(jid, { text: messageText });
  return { success: true, messageId: result?.key?.id || `msg-${Date.now()}` };
}

async function logoutWhatsApp() {
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (e) {}
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}

  currentStatus = 'disconnected';
  currentQR = null;
  currentPhone = null;
  userName = null;
  isStarting = false;

  setTimeout(() => startWhatsAppSocket(), 1500);
  return { success: true, message: 'Logged out successfully' };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Helper to respond with JSON
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    res.end(JSON.stringify(data));
  };

  // 1. GET /api/status or /status
  if (req.method === 'GET' && (url.pathname === '/api/status' || url.pathname === '/status')) {
    return sendJSON(200, {
      success: true,
      status: currentStatus,
      qr: currentQR,
      phone: currentPhone,
      name: userName,
      authDir: AUTH_DIR,
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
        const { phone, message } = body;

        if (!phone || !message) {
          return sendJSON(400, { success: false, error: 'Phone and message are required.' });
        }

        const result = await sendWhatsAppMessage(phone, message);
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
    const result = await logoutWhatsApp();
    return sendJSON(200, result);
  }

  // 4. POST /api/restart
  if (req.method === 'POST' && url.pathname === '/api/restart') {
    isStarting = false;
    startWhatsAppSocket();
    return sendJSON(200, { success: true, message: 'Restart triggered' });
  }

  sendJSON(404, { success: false, error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Ostan WhatsApp Web Gateway running on http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/status`);
  console.log(`======================================================\n`);
  startWhatsAppSocket();
});
