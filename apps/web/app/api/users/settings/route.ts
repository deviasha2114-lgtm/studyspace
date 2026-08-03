import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch from database based on user ID
    // For now, return mock settings that match our frontend form structure
    const settings = {
      themePreference: 'SYSTEM', // LIGHT, DARK, SYSTEM
      email: {
        newFollower: true,
        studyRoomInvite: true,
        newMessage: true,
        mention: true,
        achievementEarned: true,
        weeklyDigest: true,
        promotional: false
      },
      push: {
        newFollower: true,
        studyRoomInvite: true,
        newMessage: true,
        mention: true,
        achievementEarned: true,
        weeklyDigest: false,
        promotional: false
      },
      inApp: {
        newFollower: true,
        studyRoomInvite: true,
        newMessage: true,
        mention: true,
        achievementEarned: true,
        weeklyDigest: true,
        promotional: false
      }
    };

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { themePreference, email, push, inApp } = body;

    // In a real app, this would update the database
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}