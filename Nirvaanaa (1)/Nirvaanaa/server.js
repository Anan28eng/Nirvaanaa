const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./lib/socket');

// Load environment variables before anything else so database credentials are available
const possibleEnvFiles = [
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', 'env.local'),
];

possibleEnvFiles.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
});

// Prefer MONGO_URI (Atlas) or DB_URI for deployment; fall back to MONGODB_URI
if (!process.env.MONGO_URI && !process.env.DB_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/nirvaanaa';
  console.warn('[server] No Mongo connection env found; defaulting to local MongoDB at mongodb://127.0.0.1:27017/nirvaanaa');
} else {
  const used = process.env.MONGO_URI || process.env.DB_URI || process.env.MONGODB_URI;
  console.log('[server] Using Mongo connection from env:', used ? used.replace(/:[^@]+@/, ':<redacted>@') : used);
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  initSocket(server);

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> WebSocket server initialized');
  });
});
