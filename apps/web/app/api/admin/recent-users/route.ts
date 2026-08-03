import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real application, you would:
    // 1. Verify the user is an admin (check token/role)
    // 2. Fetch recent users from database

    // Mock data for recent users
    const recentUsers = [
      {
        id: 'user_001',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'PREMIUM',
        createdAt: '2026-07-28T10:30:00Z'
      },
      {
        id: 'user_002',
        name: 'Maria Garcia',
        email: 'maria@example.com',
        role: 'BASIC',
        createdAt: '2026-07-28T09:15:00Z'
      },
      {
        id: 'user_003',
        name: 'David Chen',
        email: 'david@example.com',
        role: 'PRO',
        createdAt: '2026-07-27T16:45:00Z'
      },
      {
        id: 'user_004',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'FREE',
        createdAt: '2026-07-27T14:20:00Z'
      },
      {
        id: 'user_005',
        name: 'Robert Kim',
        email: 'robert@example.com',
        role: 'ADMIN',
        createdAt: '2026-07-26T11:10:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      data: recentUsers
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent users' },
      { status: 500 }
    );
  }
}