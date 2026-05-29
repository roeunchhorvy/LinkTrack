// Redirect controller: resolves a short code, records a click, and redirects
// the visitor to the original URL. Inactive or expired links return 410/404.
const prisma = require('../config/db');
const parseUserAgent = require('../utils/parseUserAgent');
const lookupCountry = require('../utils/geoip');
const { asyncHandler } = require('../middleware/errorMiddleware');

// GET /:shortCode
const handleRedirect = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await prisma.url.findFirst({
    where: {
      OR: [{ shortCode }, { customAlias: shortCode }],
    },
  });

  if (!url) {
    // Send the SPA a useful query param so it can render a "not found" page
    return redirectToFrontend(res, 'not-found', shortCode);
  }
  if (!url.isActive) {
    return redirectToFrontend(res, 'disabled', shortCode);
  }
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    return redirectToFrontend(res, 'expired', shortCode);
  }

  // Record the click. We do this BEFORE redirecting but do not block the
  // response on it — fire and forget so the user gets redirected fast.
  recordClick(req, url.id).catch((err) => {
    console.error('Failed to record click:', err.message);
  });

  res.redirect(302, url.originalUrl);
});

async function recordClick(req, urlId) {
  const ua = req.headers['user-agent'] || '';
  const { browser, device } = parseUserAgent(ua);

  // Honor X-Forwarded-For when behind a proxy (set `app.set('trust proxy', 1)`)
  const ip = req.ip || req.connection?.remoteAddress;
  const country = lookupCountry(ip);

  await prisma.click.create({
    data: {
      urlId,
      ipAddress: ip || null,
      userAgent: ua,
      browser,
      device,
      country,
    },
  });
}

function redirectToFrontend(res, reason, code) {
  const client = process.env.CLIENT_URL || 'http://localhost:5173';
  return res.redirect(302, `${client}/expired?reason=${reason}&code=${encodeURIComponent(code)}`);
}

module.exports = { handleRedirect };
