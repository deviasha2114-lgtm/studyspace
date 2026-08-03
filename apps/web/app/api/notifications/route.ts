import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock notifications in the format expected by the frontend
    const notifications = [
      {
        id: '1',
        title: 'Welcome to StudySpace!',
        message: 'Thanks for joining our learning community. Start by creating or joining a study room.',
        icon: '🎉',
        timestamp: 'Just now',
        isRead: false,
        url: '/dashboard'
      },
      {
        id: '2',
        title: 'New Feature: AI Study Assistant',
        message: 'Try our new AI-powered doubt solver, quiz generator, and notes summarizer in any study room!',
        icon: '🤖',
        timestamp: '2 hours ago',
        isRead: false,
        url: '/study-rooms'
      },
      {
        id: '3',
        title: 'New Follower',
        message: 'Alex Johnson started following you',
        icon: '👥',
        timestamp: '1 hour ago',
        isRead: true,
        url: '/users/1'
      },
      {
        id: '4',
        title: 'Study Room Invitation',
        message: 'Sarah Chen invited you to join "Quantum Physics Study Group"',
        icon: '🏫',
        timestamp: '30 minutes ago',
        isRead: false,
        url: '/study-rooms/123'
      }
    ];

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}