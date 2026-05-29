// URL controller: create, list, fetch, update, and delete short links.
// Short codes are auto-generated unless the user supplies a custom alias.
const { z } = require('zod');

const prisma = require('../config/db');
const generateShortCode = require('../utils/generateShortCode');
const { asyncHandler } = require('../middleware/errorMiddleware');

// --- helpers ---------------------------------------------------------------
const aliasRegex = /^[a-zA-Z0-9_-]{3,32}$/;

const createSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  customAlias: z
    .string()
    .regex(aliasRegex, 'Alias must be 3-32 chars: letters, numbers, - or _')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  title: z.string().max(120).optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

const updateSchema = z.object({
  title: z.string().max(120).optional(),
  customAlias: z
    .string()
    .regex(aliasRegex, 'Alias must be 3-32 chars: letters, numbers, - or _')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isActive: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
});

function buildShortUrl(req, code) {
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/$/, '')}/${code}`;
}

// Try to generate a unique short code (retry on the very rare collision).
async function uniqueShortCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = generateShortCode();
    const exists = await prisma.url.findUnique({ where: { shortCode: code } });
    if (!exists) return code;
  }
  throw Object.assign(new Error('Could not generate a unique short code'), { status: 500 });
}

// --- handlers --------------------------------------------------------------

// POST /api/urls
const createUrl = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);

  // If the user provided a custom alias, ensure it's not taken by another
  // alias OR another short code.
  if (data.customAlias) {
    const clash = await prisma.url.findFirst({
      where: {
        OR: [{ customAlias: data.customAlias }, { shortCode: data.customAlias }],
      },
    });
    if (clash) {
      return res.status(409).json({ message: 'That alias is already taken' });
    }
  }

  const shortCode = data.customAlias || (await uniqueShortCode());

  const url = await prisma.url.create({
    data: {
      userId: req.user.id,
      originalUrl: data.originalUrl,
      shortCode,
      customAlias: data.customAlias || null,
      title: data.title || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  res.status(201).json({
    ...url,
    shortUrl: buildShortUrl(req, url.shortCode),
  });
});

// GET /api/urls
const listUrls = asyncHandler(async (req, res) => {
  const urls = await prisma.url.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { clicks: true } } },
  });

  res.json(
    urls.map((u) => ({
      id: u.id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      customAlias: u.customAlias,
      title: u.title,
      isActive: u.isActive,
      expiresAt: u.expiresAt,
      createdAt: u.createdAt,
      clickCount: u._count.clicks,
      shortUrl: buildShortUrl(req, u.shortCode),
      expired: u.expiresAt ? new Date(u.expiresAt) < new Date() : false,
    }))
  );
});

// GET /api/urls/:id
const getUrl = asyncHandler(async (req, res) => {
  const url = await prisma.url.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { _count: { select: { clicks: true } } },
  });
  if (!url) return res.status(404).json({ message: 'Link not found' });

  res.json({
    id: url.id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    customAlias: url.customAlias,
    title: url.title,
    isActive: url.isActive,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
    clickCount: url._count.clicks,
    shortUrl: buildShortUrl(req, url.shortCode),
    expired: url.expiresAt ? new Date(url.expiresAt) < new Date() : false,
  });
});

// PUT /api/urls/:id
const updateUrl = asyncHandler(async (req, res) => {
  const body = updateSchema.parse(req.body);

  const existing = await prisma.url.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ message: 'Link not found' });

  // If the alias changes, validate uniqueness and also update shortCode so
  // the public redirect URL stays in sync with the alias.
  let shortCode = existing.shortCode;
  if (body.customAlias && body.customAlias !== existing.customAlias) {
    const clash = await prisma.url.findFirst({
      where: {
        AND: [
          { id: { not: existing.id } },
          {
            OR: [
              { customAlias: body.customAlias },
              { shortCode: body.customAlias },
            ],
          },
        ],
      },
    });
    if (clash) {
      return res.status(409).json({ message: 'That alias is already taken' });
    }
    shortCode = body.customAlias;
  }

  const updated = await prisma.url.update({
    where: { id: existing.id },
    data: {
      title: body.title !== undefined ? body.title : existing.title,
      customAlias: body.customAlias !== undefined ? body.customAlias : existing.customAlias,
      shortCode,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      expiresAt:
        body.expiresAt === undefined
          ? existing.expiresAt
          : body.expiresAt === null
          ? null
          : new Date(body.expiresAt),
    },
  });

  res.json({
    ...updated,
    shortUrl: buildShortUrl(req, updated.shortCode),
  });
});

// DELETE /api/urls/:id
const deleteUrl = asyncHandler(async (req, res) => {
  const existing = await prisma.url.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ message: 'Link not found' });

  await prisma.url.delete({ where: { id: existing.id } });
  res.json({ message: 'Link deleted' });
});

module.exports = { createUrl, listUrls, getUrl, updateUrl, deleteUrl };
