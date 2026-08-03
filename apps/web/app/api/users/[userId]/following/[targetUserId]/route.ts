import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user IDs from URL
    // Path will be like /api/users/[followerId]/following/[targetUserId]
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const followerId = pathParts[pathParts.length - 3]; // Third to last
    const targetUserId = pathParts[pathParts.length - 1]; // Last

    // In a real app, this would check the database
    // For now, return mock data
    const isFollowing = Math.random() > 0.7; // 30% chance of following

    return NextResponse.json({ data: { isFollowing } });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}