import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // In a real app, this would fetch from database
    // For now, return mock following data
    const mockFollowing = [
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        bio: 'Passionate about machine learning and AI research',
        fieldOfStudy: 'Computer Science',
        level: 12,
        followerCount: 342,
        isFollowing: true, // Current user is following this person
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        bio: 'Mathematics enthusiast and problem solver',
        fieldOfStudy: 'Mathematics',
        level: 9,
        followerCount: 128,
        isFollowing: true, // Current user is following this person
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        id: '3',
        name: 'James Wilson',
        email: 'james@example.com',
        bio: 'Chemistry enthusiast lab researcher',
        fieldOfStudy: 'Chemistry',
        level: 5,
        followerCount: 67,
        isFollowing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ];

    return NextResponse.json({ data: mockFollowing });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}