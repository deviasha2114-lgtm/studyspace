import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real application, you would:
    // 1. Verify the user is an admin (check token/role)
    // 2. Fetch recent activity from database/logs

    // Mock data for recent activity
    const recentActivity = [
      {
        id: 'act_001',
        type: 'USER_SIGNUP',
        description: 'New user signed up: Emily Davis',
        timestamp: '2026-07-28T10:45:00Z',
        icon: 'UserPlus',
        color: 'green'
      },
      {
        id: 'act_002',
        type: 'PREMIUM_UPGRADE',
        description: 'User upgraded to Premium: Alex Johnson',
        timestamp: '2026-07-28T10:30:00Z',
        icon: 'TrendingUp',
        color: 'blue'
      },
      {
        id: 'act_003',
        type: 'STUDY_ROOM_CREATED',
        description: 'New study room created: Quantum Physics Study Group',
        timestamp: '2026-07-28T09:20:00Z',
        icon: 'Users',
        color: 'purple'
      },
      {
        id: 'act_004',
        type: 'BADGE_EARNED',
        description: 'User earned badge: Maria Garcia - "Quick Learner"',
        timestamp: '2026-07-28T08:15:00Z',
        icon: 'Award',
        color: 'yellow'
      },
      {
        id: 'act_005',
        type: 'QUIZ_COMPLETED',
        description: 'Quiz completed: 15 users took "Python Basics" quiz',
        timestamp: '2026-07-27T16:30:00Z',
        icon: 'List',
        color: 'indigo'
      },
      {
        id: 'act_006',
        type: 'CONTENT_REPORTED',
        description: 'Content reported and reviewed: Inappropriate comment in chat',
        timestamp: '2026-07-27T15:45:00Z',
        icon: 'Flag',
        color: 'red'
      }
    ];

    return NextResponse.json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}