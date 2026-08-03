const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user profile with points, level, streak, badges
async function getProfile(req, res) {
  try {
    const { userId } = req.params;
    // Ensure user can only view their own profile unless admin? For now allow any.
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

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

// Daily check-in to update streak
async function dailyCheckIn(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let streak = user.dailyStreak || 0;
    let lastCheckIn = user.lastCheckInDate ? new Date(user.lastCheckInDate) : null;

    if (lastCheckIn) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());

      if (lastDate.getTime() === yesterday.getTime()) {
        // consecutive day
        streak += 1;
      } else if (lastDate.getTime() === today.getTime()) {
        // already checked in today
        streak = streak; // no change
      } else {
        // gap in days
        streak = 1;
      }
    } else {
      // first check-in
      streak = 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyStreak: streak,
        lastCheckInDate: today,
      },
      select: {
        id: true,
        dailyStreak: true,
        lastCheckInDate: true,
      },
    });

    // Optionally award points for check-in (e.g., 10 points per day)
    // We'll add points via a separate function or directly here.
    // For simplicity, we'll add 10 points.
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: 10 },
      },
    });

    // Check for badge awards based on streak
    await checkAndAwardBadge(userId, 'streak_3', streak >= 3);
    await checkAndAwardBadge(userId, 'streak_7', streak >= 7);
    await checkAndAwardBadge(userId, 'streak_30', streak >= 30);

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Daily check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  }
}

// Helper to award badge if condition met and not already earned
async function checkAndAwardBadge(userId, badgeKey, conditionMet) {
  if (!conditionMet) return;

  // Find badge by criteria (we'll assume we have a way to map key to badge)
  // For simplicity, we'll create a badge if not exists based on key.
  // In a real app, badges are predefined.
  const badge = await prisma.badge.findFirst({
    where: {
      // We'll use a simple mapping: name contains key or we could have a field 'key'
      // Since we don't have a key field, we'll skip for now.
      // We'll implement a simple badge system later.
    },
  });

  // Placeholder: actual badge awarding logic to be implemented when badges are seeded.
}

// Add points (for testing or specific actions)
async function addPoints(req, res) {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: 'Valid points required' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
        // Optionally update level based on points
        level: {
          // Simple level calculation: level = floor(points / 1000) + 1
          // We'll compute after update via a separate query or use a virtual.
          // For simplicity, we'll update level in a separate step.
        },
      },
    });

    // Recalculate level
    const newLevel = Math.floor(user.totalPoints / 1000) + 1;
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    // Log activity (optional)
    // await prisma.activityLog.create({ ... });

    res.json({ success: true, message: `Added ${points} points`, data: { totalPoints: user.totalPoints + points, level: newLevel } });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
}

// Get all badges (for reference)
async function getBadges(req, res) {
  try {
    const badges = await prisma.badge.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        iconUrl: true,
      },
    });
    res.json({ success: true, data: badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

// Get leaderboard top users by points
async function getLeaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await prisma.user.findMany({
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
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

module.exports = {
  getProfile,
  dailyCheckIn,
  addPoints,
  getBadges,
  getLeaderboard,
};