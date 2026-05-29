// Entrypoint: loads env vars, then starts the HTTP server.
require('dotenv').config();

const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`LinkTrack API running on http://localhost:${PORT}`);
});

// Graceful shutdown so Prisma releases its DB connections cleanly.
async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
