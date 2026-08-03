// apps/api/src/routes/search.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rateLimiter } = require('../middleware/rateLimiter.middleware');

const prisma = new PrismaClient();

// Rate limit: 60 requests/minute per user
const searchRateLimit = rateLimiter({ max: 60, windowMs: 60 * 1000 });

// GET /api/search?q=&type=notes|users|communities|all&page=
router.get('/', authMiddleware, searchRateLimit, async (req, res) => {
  try {
    const { q = '', type = 'all', page = 1 } = req.query;
    const userId = req.user.id;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;

    if (!q.trim()) {
      return res.json({ notes: [], users: [], communities: [], total: 0 });
    }

    let notes = [], users = [], communities = [];

    // Search Notes (only APPROVED, public communities only)
    if (type === 'all' || type === 'notes') {
      notes = await prisma.note.findMany({
        where: {
          status: 'APPROVED',
          community: { isPrivate: false },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          community: { select: { id: true, name: true, slug: true } },
        },
        skip,
        take: limit,
      });
    }

    // Search Users
    if (type === 'all' || type === 'users') {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
        skip,
        take: limit,
      });
    }

    // Search Communities (public only)
    if (type === 'all' || type === 'communities') {
      communities = await prisma.community.findMany({
        where: {
          isPrivate: false,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          coverUrl: true,
          _count: { select: { members: true } },
        },
        skip,
        take: limit,
      });
    }

    const totalResults = notes.length + users.length + communities.length;

    // Save search log
    await prisma.searchLog.create({
      data: {
        userId,
        query: q,
        type: type.toUpperCase(),
        results: totalResults,
      },
    });

    res.json({ notes, users, communities, total: totalResults, page: parseInt(page) });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
