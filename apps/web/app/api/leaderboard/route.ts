import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch from database with proper sorting
    // For now, return mock leaderboard data
    const leaderboard = [
      {
        id: '1',
        userId: 'user-1',
        name: 'Alex Chen',
        avatar: 'A',
        level: 15,
        points: 3450,
        streak: 28,
        badgesCount: 12,
        rank: 1
      },
      {
        id: '2',
        userId: 'user-2',
        name: 'Sam Rivera',
        avatar: 'S',
        level: 13,
        points: 3120,
        streak: 22,
        badgesCount: 10,
        rank: 2
      },
      {
        id: '3',
        userId: 'user-3',
        name: 'Taylor Kim',
        avatar: 'T',
        level: 12,
        points: 2980,
        streak: 19,
        badgesCount: 9,
        rank: 3
      },
      {
        id: '4',
        userId: 'user-4',
        name: 'Jordan Lee',
        avatar: 'J',
        level: 11,
        points: 2750,
        streak: 15,
        badgesCount: 8,
        rank: 4
      },
      {
        id: '5',
        userId: 'user-5',
        name: 'Casey Wong',
        avatar: 'C',
        level: 10,
        points: 2540,
        streak: 12,
        badgesCount: 7,
        rank: 5
      },
      {
        id: '6',
        userId: 'user-6',
        name: 'Riley Patel',
        avatar: 'R',
        level: 9,
        points: 2310,
        streak: 10,
        badgesCount: 6,
        rank: 6
      },
      {
        id: '7',
        userId: 'user-7',
        name: 'Morgan Davis',
        avatar: 'M',
        level: 8,
        points: 2080,
        streak: 8,
        badgesCount: 5,
        rank: 7
      },
      {
        id: '8',
        userId: 'user-8',
        name: 'Quinn Taylor',
        avatar: 'Q',
        level: 7,
        points: 1850,
        streak: 6,
        badgesCount: 4,
        rank: 8
      },
      {
        id: '9',
        userId: 'user-9',
        name: 'Peyton Morgan',
        avatar: 'P',
        level: 6,
        points: 1620,
        streak: 4,
        badgesCount: 3,
        rank: 9
      },
      {
        id: '10',
        userId: 'user-10',
        name: 'Morgan Avery',
        avatar: 'M',
        level: 5,
        points: 1400,
        streak: 2,
        badgesCount: 2,
        rank: 10
      }
    ];

    return NextResponse.json({ data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}