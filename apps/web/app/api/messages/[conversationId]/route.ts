import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch a specific conversation from a database
    // For now, return mock data
    const conversation = {
      id: 'conv-1',
      otherUserId: 'user-2',
      otherUserName: 'Alex Chen',
      lastMessage: 'Did you understand the lecture on integration techniques?',
      lastMessageTime: '2026-07-30T14:30:00Z',
      unreadCount: 2,
      isOnline: true
    };

    return NextResponse.json({ data: conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would create a new conversation
    // For now, return success
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Conversation created successfully',
        data: {
          id: `conv-${Date.now()}`,
          otherUserId: userId,
          unreadCount: 0
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}