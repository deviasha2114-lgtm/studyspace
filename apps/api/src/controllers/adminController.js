const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        themePreference: true,
        totalPoints: true,
        level: true,
        dailyStreak: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            notes: true,
            notifications: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        themePreference: true,
        totalPoints: true,
        level: true,
        dailyStreak: true,
        lastCheckInDate: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        _count: {
          select: {
            notes: true,
            notifications: true,
            payments: true,
            studyRoomHost: true,
            studyRoomParticipant: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['ADMIN', 'MODERATOR', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Get system statistics (admin only)
const getSystemStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get various statistics
    const [
      totalUsers,
      activeUsersToday,
      totalNotes,
      totalStudyRooms,
      totalPayments,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastCheckInDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.note.count(),
      prisma.studyRoom.count(),
      prisma.payment.count({
        where: { status: 'SUCCESS' }
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      })
    ]);

    // Get user role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          activeToday: activeUsersToday,
          roleDistribution: Object.fromEntries(
            roleDistribution.map(r => [r.role, r._count])
          )
        },
        content: {
          totalNotes,
          totalStudyRooms
        },
        revenue: {
          totalPayments: totalPayments || 0,
          totalAmount: (totalRevenue._sum.amount || 0) / 100 // Convert cents to dollars
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

// Get recent activity (admin only)
const getRecentActivity = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const limit = parseInt(req.query.limit) || 50;

    // Get recent activities from different sources
    const [
      recentUsers,
      recentNotes,
      recentPayments,
      recentStudyRooms
    ] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.note.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.payment.findMany({
        take: limit,
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          createdAt: true,
          user: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.studyRoom.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
          host: {
            select: { id: true, name: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: recentUsers,
        notes: recentNotes,
        payments: recentPayments,
        studyRooms: recentStudyRooms
      }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getSystemStats,
  getRecentActivity
};