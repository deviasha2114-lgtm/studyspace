import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from URL (in a real app, we'd use Next.js dynamic routes)
    // For now, we'll assume it's in the URL or we can get it from the token
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1]; // Last part of the path

    // In a real app, we'd fetch from database
    // For now, return mock data
    const profile = {
      id: userId || 'current-user-id',
      name: 'Current User',
      email: 'user@example.com',
      themePreference: 'SYSTEM',
      bio: 'Passionate learner dedicated to mastering new skills and helping others grow.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2026-01-15T08:30:00Z',
      level: 12,
      totalPoints: 2450,
      dailyStreak: 18,
      achievementsCount: 8,
      followerCount: 427,
      followingCount: 189
    };

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}