import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get target user ID from URL (in a real app, we'd use Next.js dynamic routes)
    // For now, we'll extract it from the path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // Path will be like /api/users/[userId]/follow
    const targetUserId = pathParts[pathParts.length - 2]; // Second to last part

    const { action } = await request.json(); // 'follow' or 'unfollow'

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Target user ID and action (follow/unfollow) are required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the database
    // For now, return success based on action
    if (action === 'follow') {
      return NextResponse.json(
        {
          message: `Successfully followed user ${targetUserId}`,
          data: { following: true, followerCount: Math.floor(Math.random() * 1000) }
        }
      );
    } else if (action === 'unfollow') {
      return NextResponse.json(
        {
          message: `Successfully unfollowed user ${targetUserId}`,
          data: { following: false, followerCount: Math.floor(Math.random() * 1000) }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in follow/unfollow action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}