import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch conversations from a database
    // For now, return mock data
    const conversations = [
      {
        id: 'conv-1',
        otherUserId: 'user-2',
        otherUserName: 'Alex Chen',
        lastMessage: 'Did you understand the lecture on integration techniques?',
        lastMessageTime: '2026-07-30T14:30:00Z',
        unreadCount: 2,
        isOnline: true
      },
      {
        id: 'conv-2',
        otherUserId: 'user-3',
        otherUserName: 'Sam Rivera',
        lastMessage: 'I\'ll share my notes from yesterday\'s class.',
        lastMessageTime: '2026-07-29T16:45:00Z',
        unreadCount: 0,
        isOnline: false
      },
      {
        id: 'conv-3',
        otherUserId: 'user-4',
        otherUserName: 'Taylor Kim',
        lastMessage: 'Thanks for helping me with the problem set!',
        lastMessageTime: '2026-07-28T09:15:00Z',
        unreadCount: 0,
        isOnline: true
      },
      {
        id: 'conv-4',
        otherUserId: 'user-5',
        otherUserName: 'Jordan Lee',
        lastMessage: 'Can we meet tomorrow to work on the group project?',
        lastMessageTime: '2026-07-27T11:20:00Z',
        unreadCount: 1,
        isOnline: false
      }
    ];

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversation ID from URL (in a real app, we'd use Next.js dynamic routes)
    // For now, return mock messages for a conversation
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 1]; // Last part of the path

    // Mock messages for the conversation
    const messages = [
      {
        id: 'msg-1',
        conversationId: conversationId || 'conv-1',
        senderId: 'user-2',
        senderName: 'Alex Chen',
        content: 'Hey! Did you get a chance to look at the calculus problem  at the practice problems I sent?',
        timestamp: '2026-07-30T10:15:00Z',
        read: true
      },
      {
        id: 'msg-2',
        conversationId: conversationId || 'conv-1',
        senderId: 'current-user',
        senderName: 'Current User',
        content: 'Yeah, I looked at them. The third one is tricky with the substitution rule.',
        timestamp: '2026-07-30T10:20:00Z',
        read: true
      },
      {
        id: 'msg-3',
        conversationId: conversationId || 'conv-1',
        senderId: 'user-2',
        senderName: 'Alex Chen',
        content: 'Yeah, I had trouble with that too. Let me show you how I approached it.',
        timestamp: '2026-07-30T10:25:00Z',
        read: true
      },
      {
        id: 'msg-4',
        conversationId: conversationId || 'conv-1',
        senderId: 'current-user',
        senderName: 'Current User',
        content: 'That would be great! Thanks!',
        timestamp: '2026-07-30T10:30:00Z',
        read: false
      }
    ];

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
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

    // Get conversation ID from URL (in a real app, we'd use Next.js dynamic routes)
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 2]; // Second to last part

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // In a real app, this would save to a database
    // For now, return success with mock data
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || 'conv-1',
      senderId: 'current-user',
      senderName: 'Current User',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        data: newMessage
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}