const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ogg':  'video/ogg',
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red:   '\x1b[31m',
  cyan:  '\x1b[36m',
  gray:  '\x1b[90m',
};

function log(status, method, url, ms) {
  const color = status >= 400 ? COLORS.red : COLORS.green;
  const time = new Date().toLocaleTimeString();
  console.log(
    `${COLORS.gray}[${time}]${COLORS.reset} ` +
    `${color}${status}${COLORS.reset} ` +
    `${COLORS.cyan}${method}${COLORS.reset} ` +
    `${url} ` +
    `${COLORS.gray}(${ms}ms)${COLORS.reset}`
  );
}

const server = http.createServer((req, res) => {
  const start = Date.now();

  // Strip query string and decode URI (handles spaces and special chars in filenames)
  let urlPath = req.url.split('?')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch {}

  if (urlPath === '/') urlPath = '/index.html';

  // Prevent directory traversal
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    log(403, req.method, urlPath, Date.now() - start);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    const ms = Date.now() - start;
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      log(404, req.method, urlPath, ms);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
    log(200, req.method, urlPath, ms);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n  ${COLORS.green}✓${COLORS.reset} Server running at ${COLORS.cyan}http://localhost:${port}${COLORS.reset}\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`${COLORS.gray}Port ${port} in use, trying ${port + 1}...${COLORS.reset}`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(PORT);

