const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');

// GET /api/gamification/profile/:userId
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    // Ensure user can only view their own profile (or allow admin? for now restrict)
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden: can only view own profile' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
        dailyStreak: true,
        lastCheckInDate: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format badges for response
    const formattedBadges = user.badges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      iconUrl: ub.badge.iconUrl,
      earnedAt: ub.earnedAt,
    }));

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
        level: user.level,
        dailyStreak: user.dailyStreak,
        lastCheckInDate: user.lastCheckInDate,
        badges: formattedBadges,
      },
    });
  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/gamification/checkin
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dailyStreak: true,
        lastCheckInDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newStreak = user.dailyStreak;
    const lastCheckIn = user.lastCheckInDate ? new Date(user.lastCheckInDate) : null;

    if (lastCheckIn) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastDay = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());

      if (lastDay.getTime() === yesterday.getTime()) {
        // consecutive day
        newStreak += 1;
      } else if (lastDay.getTime() === today.getTime()) {
        // already checked in today
        return res.status(400).json({ error: 'Already checked in today' });
      } else {
        // streak broken
        newStreak = 1;
      }
    } else {
      // first checkin
      newStreak = 1;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyStreak: newStreak,
        lastCheckInDate: today,
      },
    });

    // Optionally award points for checkin (e.g., 10 points per day)
    const pointsToAdd = 10;
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: pointsToAdd,
        },
      },
    });

    // Check for streak-based badges (example: 7-day streak badge)
    // We'll implement badge awarding separately; for now just return updated data.

    res.json({
      success: true,
      data: {
        streak: newStreak,
        pointsAdded: pointsToAdd,
        lastCheckInDate: today,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// POST /api/gamification/add-points (for testing / internal use)
router.post('/add-points', authenticate, async (req, res) => {
  try {
    const { points } = req.body;
    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: 'Valid points number required' });
    }

    const userId = req.user.id;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: points,
        },
      },
      select: {
        id: true,
        totalPoints: true,
      },
    });

    // Level calculation example: every 100 points = level up
    const newLevel = Math.floor(user.totalPoints / 100) + 1;
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          level: newLevel,
        },
      });
    }

    res.json({
      success: true,
      data: {
        addedPoints: points,
        newTotal: user.totalPoints,
        newLevel: newLevel,
      },
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// GET /api/gamification/badges
router.get('/badges', authenticate, async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        iconUrl: true,
        criteria: true,
      },
    });

    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error('Fetch badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topUsers = await prisma.user.findMany({
      orderBy: {
        totalPoints: 'desc',
      },
      take: limit,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        totalPoints: true,
        level: true,
      },
    });

    res.json({
      success: true,
      data: topUsers,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;