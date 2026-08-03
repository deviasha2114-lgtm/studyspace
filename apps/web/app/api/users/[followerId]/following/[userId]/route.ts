import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user IDs from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // Path will be like /api/users/[followerId]/following/[userId]
    const followerId = pathParts[pathParts.length - 3]; // Third to last part
    const userId = pathParts[pathParts.length - 1]; // Last part

    // In a real app, this would check the database
    // For now, return mock data
    const isFollowing = Math.random() > 0.7; // 30% chance of following for demo

    return NextResponse.json({ data: { isFollowing } });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}