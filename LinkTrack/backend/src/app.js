// Express app definition. Kept separate from server.js so it's easy to test.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const redirectRoutes = require('./routes/redirectRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust the first proxy hop so req.ip reflects the real client when behind
// a reverse proxy (Heroku, Render, Nginx, etc.).
app.set('trust proxy', 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Limit auth endpoints to slow down brute-force attempts (15 min window).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Public redirect route (must be mounted last so it doesn't shadow /api/*)
app.use('/', redirectRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
