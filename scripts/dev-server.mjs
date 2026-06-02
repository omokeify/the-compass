import http from 'node:http';
import fs from 'node:fs/promises';
import { join, extname } from 'node:path';
import { exec } from 'node:child_process';
import { AccessToken } from 'livekit-server-sdk';

// Read .env manually
const envPath = join(process.cwd(), '.env');
try {
  const envText = await fs.readFile(envPath, 'utf-8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq !== -1) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {}

const PORT = 5173;
const HOST = '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const urlPath = decodeURIComponent(parsedUrl.pathname);

  // --- LiveKit token endpoint ---
  if (req.method === 'POST' && urlPath === '/api/livekit-token') {
    try {
      let body = '';
      req.on('data', c => body += c);
      await new Promise(r => req.on('end', r));
      const { identity, room, canPublish } = JSON.parse(body);

      const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        { identity, ttl: '1h' }
      );
      at.addGrant({ roomJoin: true, room, canPublish: !!canPublish, canSubscribe: true });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token: at.toJwt() }));
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // --- Static file serving ---
  let filePath = join(process.cwd(), urlPath);

  try {
    let stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html');
      stat = await fs.stat(filePath);
    }
  } catch {
    filePath = join(process.cwd(), 'index.html');
  }

  try {
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${err.message}`);
  }
});

function startServer(port) {
  server.listen(port, HOST, () => {
    const url = `http://${HOST}:${port}/`;
    console.log(`\n  🚀 Compass Dev Server running at: ${url}\n`);

    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} ${url}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
