import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // In a real app, this would save the post to the database
    // For now, return a mock created post
    const newPost = {
      id: Date.now().toString(),
      content: content.trim(),
      authorName: 'Current User', // Would come from decoded token
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    return NextResponse.json({ data: newPost });
  } catch (error) {
    console.error('Error creating club post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}