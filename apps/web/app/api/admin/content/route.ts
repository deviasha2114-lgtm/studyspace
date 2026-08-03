import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // In a real application, you would:
    // 1. Verify the user is an admin (check token/role)
    // 2. Fetch content pending moderation from database

    // Mock data for content moderation
    const content = [
      {
        id: 'cont_001',
        type: 'COMMENT',
        title: 'User comment in Physics study room',
        description: 'User posted: "This explanation of quantum mechanics is incorrect..."',
        priority: 'medium',
        status: 'pending',
        timestamp: '2026-07-28T10:30:00Z'
      },
      {
        id: 'cont_002',
        type: 'POST',
        title: 'Study guide upload',
        description: 'User uploaded study guide: "Advanced Calculus Formulas.pdf"',
        priority: 'low',
        status: 'pending',
        timestamp: '2026-07-28T09:15:00Z'
      },
      {
        id: 'cont_003',
        type: 'MESSAGE',
        title: 'Chat message in chat room',
        description: 'User sent: "Can someone help me with this problem? 2+2=5"',
        priority: 'high',
        status: 'pending',
        timestamp: '2026-07-28T08:45:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}