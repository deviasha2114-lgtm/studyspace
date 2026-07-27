// apps/api/src/routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');
const { isMember } = require('../middleware/isMember.middleware');

const prisma = new PrismaClient();

// GET /api/analytics/community/:id
router.get('/community/:id', authMiddleware, isMember, async (req, res) => {
  try {
    const { id } = req.params;

    const [memberCount, noteCount, messageCount, topNotes] = await Promise.all([
      prisma.communityMember.count({ where: { communityId: id } }),

      prisma.note.count({ where: { communityId: id, status: 'APPROVED' } }),

      prisma.message.count({ where: { communityId: id } }),

      prisma.note.findMany({
        where: { communityId: id, status: 'APPROVED' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { noteViews: true } },
        },
        orderBy: { noteViews: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    res.json({ memberCount, noteCount, messageCount, topNotes });
  } catch (error) {
    console.error('Community analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch community analytics' });
  }
});

// GET /api/analytics/notes/:id
router.get('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
        _count: {
          select: { noteViews: true, reports: true },
        },
      },
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({
      id: note.id,
      title: note.title,
      status: note.status,
      createdAt: note.createdAt,
      author: note.author,
      viewCount: note._count.noteViews,
      reportCount: note._count.reports,
    });
  } catch (error) {
    console.error('Note analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch note analytics' });
  }
});

// GET /api/analytics/user/:id
router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [notesCount, communitiesCount, followersCount] = await Promise.all([
      prisma.note.count({ where: { authorId: id } }),
      prisma.communityMember.count({ where: { userId: id } }),
      prisma.follow.count({ where: { followingId: id } }),
    ]);

    res.json({ notesCount, communitiesCount, followersCount });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// POST /api/notes/:id/view — track note view
router.post('/notes/:id/view', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.noteView.upsert({
      where: { noteId_userId: { noteId: id, userId } },
      update: {},
      create: { noteId: id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Note view error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

module.exports = router;
