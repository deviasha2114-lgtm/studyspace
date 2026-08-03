const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get analytics dashboard data
const getAnalyticsDashboard = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get date ranges for comparison
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run multiple queries in parallel
    const [
      // User growth metrics
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsersToday,
      activeUsersThisWeek,

      // Engagement metrics
      totalNotes,
      notesCreatedThisMonth,
      totalStudyRooms,
      studyRoomsCreatedThisMonth,
      totalMessages,
      messagesSentThisMonth,

      // Revenue metrics
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,

      // Subscription metrics
      activeSubscriptions,
      subscriptionsThisMonth,
      subscriptionsLastMonth,

      // Content metrics
      approvedNotes,
      pendingNotes,
      rejectedNotes,

      // User retention
      usersWithStreak,

      // Feature usage
      aiSessionCount,
      aiSessionsThisMonth
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // New users last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        }
      }),

      // Active users today (checked in today)
      prisma.user.count({
        where: {
          lastCheckInDate: {
            gte: new Date(now.setHours(0, 0, 0, 0))
          }
        }
      }),

      // Active users this week (last 7 days)
      prisma.user.count({
        where: {
          lastCheckInDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total notes
      prisma.note.count(),

      // Notes created this month
      prisma.note.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Total study rooms
      prisma.studyRoom.count(),

      // Study rooms created this month
      prisma.studyRoom.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Total messages
      prisma.message.count(),

      // Messages sent this month
      prisma.message.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Total revenue (sum of successful payments in cents)
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS'
        },
        _sum: {
          amount: true
        }
      }),

      // Revenue this month
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Revenue last month
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Active subscriptions
      prisma.subscription.count({
        where: {
          active: true
        }
      }),

      // Subscriptions this month
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Subscriptions last month
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfMonth
          }
        }
      }),

      // Approved notes
      prisma.note.count({
        where: {
          status: 'APPROVED'
        }
      }),

      // Pending notes
      prisma.note.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Rejected notes
      prisma.note.count({
        where: {
          status: 'REJECTED'
        }
      }),

      // Users with streak > 0
      prisma.user.count({
        where: {
          dailyStreak: {
            gt: 0
          }
        }
      }),

      // AI sessions count
      prisma.aISession.count(),

      // AI sessions this month
      prisma.aISession.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0 ? 100 : 0;

    const revenueGrowthRate = revenueLastMonth._sum.amount > 0
      ? ((revenueThisMonth._sum.amount - revenueLastMonth._sum.amount) / revenueLastMonth._sum.amount) * 100
      : revenueThisMonth._sum.amount > 0 ? 100 : 0;

    const subscriptionGrowthRate = subscriptionsLastMonth > 0
      ? ((subscriptionsThisMonth - subscriptionsLastMonth) / subscriptionsLastMonth) * 100
      : subscriptionsThisMonth > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          newLastMonth: newUsersLastMonth,
          growthRate: parseFloat(userGrowthRate.toFixed(2)),
          activeToday: activeUsersToday,
          activeThisWeek: activeUsersThisWeek
        },
        engagement: {
          notes: {
            total: totalNotes,
            createdThisMonth: notesCreatedThisMonth
          },
          studyRooms: {
            total: totalStudyRooms,
            createdThisMonth: studyRoomsCreatedThisMonth
          },
          messages: {
            total: totalMessages,
            sentThisMonth: messagesSentThisMonth
          }
        },
        revenue: {
          total: totalRevenue._sum.amount || 0, // in cents
          thisMonth: revenueThisMonth._sum.amount || 0, // in cents
          lastMonth: revenueLastMonth._sum.amount || 0, // in cents
          growthRate: parseFloat(revenueGrowthRate.toFixed(2)),
          formatted: {
            total: ((totalRevenue._sum.amount || 0) / 100).toFixed(2),
            thisMonth: ((revenueThisMonth._sum.amount || 0) / 100).toFixed(2),
            lastMonth: ((revenueLastMonth._sum.amount || 0) / 100).toFixed(2)
          }
        },
        subscriptions: {
          active: activeSubscriptions,
          newThisMonth: subscriptionsThisMonth,
          newLastMonth: subscriptionsLastMonth,
          growthRate: parseFloat(subscriptionGrowthRate.toFixed(2))
        },
        content: {
          notes: {
            approved: approvedNotes,
            pending: pendingNotes,
            rejected: rejectedNotes
          }
        },
        retention: {
          usersWithStreak: usersWithStreak,
          streakPercentage: totalUsers > 0 ? ((usersWithStreak / totalUsers) * 100).toFixed(2) : '0'
        },
        features: {
          aiSessions: {
            total: aiSessionCount,
            thisMonth: aiSessionsThisMonth
          }
        }
      }
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
  }
};

// Get user engagement metrics over time
const getUserEngagementOverTime = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const days = parseInt(req.query.days) || 30; // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily user activity for the last N days
    const dailyActivity = await Promise.all(
      Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        return prisma.user.count({
          where: {
            lastCheckInDate: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        }).then(count => ({
          date: startOfDay.toISOString().split('T')[0],
          activeUsers: count
        }));
      })
    );

    // Reverse to get chronological order
    dailyActivity.reverse();

    res.json({
      success: true,
      data: dailyActivity
    });
  } catch (error) {
    console.error('Get user engagement over time error:', error);
    res.status(500).json({ error: 'Failed to fetch user engagement over time' });
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const months = parseInt(req.query.months) || 6; // Default to last 6 months
    const endDate = new Date();
    const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000); // Approximate

    // Get monthly revenue for the last N months
    const monthlyRevenue = await Promise.all(
      Array.from({ length: months }, async (_, i) => {
        const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const revenue = await prisma.payment.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: {
              gte: startOfMonth,
              lt: endOfMonth
            }
          },
          _sum: {
            amount: true
          }
        });

        return {
          month: startOfMonth.toISOString().slice(0, 7), // YYYY-MM
          revenue: revenue._sum.amount || 0, // in cents
          formatted: ((revenue._sum.amount || 0) / 100).toFixed(2)
        };
      })
    );

    // Reverse to get chronological order
    monthlyRevenue.reverse();

    res.json({
      success: true,
      data: monthlyRevenue
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

module.exports = {
  getAnalyticsDashboard,
  getUserEngagementOverTime,
  getRevenueAnalytics
};