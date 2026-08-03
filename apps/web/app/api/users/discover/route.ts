import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameter from URL
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';

    // In a real app, this would fetch from database with search filtering
    // For now, return mock data
    const mockUsers = [
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        bio: 'Passionate about machine learning and AI research',
        fieldOfStudy: 'Computer Science',
        level: 12,
        followerCount: 342,
        isFollowing: false,
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
        isFollowing: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        id: '3',
        name: 'Marcus Rodriguez',
        email: 'marcus@example.com',
        bio: 'Physics student passionate about quantum mechanics',
        fieldOfStudy: 'Physics',
        level: 7,
        followerCount: 89,
        isFollowing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a48e?w=150'
      },
      {
        id: '4',
        name: 'Priya Patel',
        email: 'priya@example.com',
        bio: 'Literature lover and aspiring writer',
        fieldOfStudy: 'Literature',
        level: 11,
        followerCount: 256,
        isFollowing: false,
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      {
        id: '5',
        name: 'David Kim',
        email: 'david@example.com',
        bio: 'Aspiring software engineer and open-source contributor',
        fieldOfStudy: 'Software Engineering',
        level: 10,
        followerCount: 178,
        isFollowing: true,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      }
    ];

    // Filter users based on search term
    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fieldOfStudy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return NextResponse.json({ data: filteredUsers });
  } catch (error) {
    console.error('Error discovering users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}