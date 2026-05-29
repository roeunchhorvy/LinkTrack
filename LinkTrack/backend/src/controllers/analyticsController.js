// Analytics controller: summary across all of a user's links, and per-link detail.
const prisma = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Group clicks by calendar day (UTC) and return [{ date, count }] sorted ascending.
function groupByDay(clicks) {
  const buckets = new Map();
  for (const click of clicks) {
    const day = new Date(click.clickedAt).toISOString().slice(0, 10); // YYYY-MM-DD
    buckets.set(day, (buckets.get(day) || 0) + 1);
  }
  return Array.from(buckets, ([date, count]) => ({ date, count })).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function tally(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item[key] || 'Unknown';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (a, b) => b.count - a.count
  );
}

// GET /api/analytics/summary
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalLinks, urls] = await Promise.all([
    prisma.url.count({ where: { userId } }),
    prisma.url.findMany({
      where: { userId },
      include: {
        _count: { select: { clicks: true } },
        clicks: { select: { clickedAt: true } },
      },
    }),
  ]);

  const allClicks = urls.flatMap((u) => u.clicks);
  const totalClicks = allClicks.length;

  const topLinks = urls
    .map((u) => ({
      id: u.id,
      title: u.title,
      shortCode: u.shortCode,
      originalUrl: u.originalUrl,
      clickCount: u._count.clicks,
    }))
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 5);

  res.json({
    totalLinks,
    totalClicks,
    dailyClicks: groupByDay(allClicks),
    topLinks,
  });
});

// GET /api/analytics/url/:id
const getUrlAnalytics = asyncHandler(async (req, res) => {
  const url = await prisma.url.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!url) return res.status(404).json({ message: 'Link not found' });

  const clicks = await prisma.click.findMany({
    where: { urlId: url.id },
    orderBy: { clickedAt: 'desc' },
  });

  res.json({
    url: {
      id: url.id,
      title: url.title,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
    },
    totalClicks: clicks.length,
    dailyClicks: groupByDay(clicks),
    browsers: tally(clicks, 'browser'),
    devices: tally(clicks, 'device'),
    countries: tally(clicks, 'country'),
    // Cap recent history at 50 rows so a popular link doesn't bloat the payload
    recent: clicks.slice(0, 50).map((c) => ({
      id: c.id,
      clickedAt: c.clickedAt,
      browser: c.browser,
      device: c.device,
      country: c.country,
      ipAddress: c.ipAddress,
    })),
  });
});

module.exports = { getSummary, getUrlAnalytics };
