import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, we'd fetch from database based on user and club id
    // For now, return mock data
    const club = {
      id: '1',
      name: 'Mathematics Enthusiasts',
      description: 'A club for students who love mathematics and want to explore advanced topics together.',
      category: 'STEM',
      memberCount: 42,
      isPrivate: false,
      createdAt: '2026-01-15T10:30:00Z',
      isMember: true
    };

    return NextResponse.json({ data: club });
  } catch (error) {
    console.error('Error fetching club:', error);
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

    // Return mock posts for the club
    const posts = [
      {
        id: '1',
        content: 'Anyone interested in discussing topology this week?',
        authorName: 'Alice Johnson',
        createdAt: '2026-07-30T14:30:00Z',
        likes: 12,
        comments: 5
      },
      {
        id: '2',
        content: 'Just finished reading "Principia Mathematica" - mind blown!',
        authorName: 'Bob Smith',
        createdAt: '2026-07-29T09:15:00Z',
        likes: 8,
        comments: 3
      },
      {
        id: '3',
        content: 'Study group meeting tomorrow at 3pm in room 205.',
        authorName: 'Carol Davis',
        createdAt: '2026-07-28T16:45:00Z',
        likes: 15,
        comments: 8
      }
    ];

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Error fetching club posts:', error);
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

    // Get club ID from URL (in a real app, we'd use Next.js dynamic routes)
    // For now, just return success
    const { action } = await request.json();

    if (action === 'join') {
      return NextResponse.json({ message: 'Successfully joined club' });
    } else if (action === 'leave') {
      return NextResponse.json({ message: 'Successfully left club' });
    }

    return NextResponse.json({ message: 'Action completed' });
  } catch (error) {
    console.error('Error in club action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}