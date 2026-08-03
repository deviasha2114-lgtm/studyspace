import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch from database based on user ID
    // For now, return mock badges data
    const badges = [
      {
        id: 'badge-1',
        name: 'First Steps',
        description: 'Completed your first lesson',
        icon: '👶',
        category: 'Milestone',
        points: 10,
        rarity: 'Common',
        earnedDate: '2026-07-01T10:00:00Z',
        progress: 100,
        required: 1
      },
      {
        id: 'badge-2',
        name: 'Knowledge Seeker',
        description: 'Complete 10 lessons',
        icon: '🔍',
        category: 'Learning',
        points: 50,
        rarity: 'Common',
        earnedDate: '2026-07-05T14:30:00Z',
        progress: 8,
        required: 10
      },
      {
        id: 'badge-3',
        name: 'Discussion Starter',
        description: 'Start 5 discussions in study rooms',
        icon: '💬',
        category: 'Social',
        points: 30,
        rarity: 'Common',
        earnedDate: null,
        progress: 3,
        required: 5
      },
      {
        id: 'badge-4',
        name: 'Helper',
        description: 'Help 3 peers with their questions',
        icon: '🤝',
        category: 'Community',
        points: 40,
        rarity: 'Uncommon',
        earnedDate: '2026-07-10T09:15:00Z',
        progress: 3,
        required: 3
      },
      {
        id: 'badge-5',
        name: 'Quiz Master',
        description: 'Score 90%+ on 5 quizzes',
        icon: '🏆',
        category: 'Achievement',
        points: 75,
        rarity: 'Rare',
        earnedDate: null,
        progress: 2,
        required: 5
      },
      {
        id: 'badge-6',
        name: 'Study Streak',
        description: 'Maintain a 7-day study streak',
        icon: '🔥',
        category: 'Consistency',
        points: 60,
        rarity: 'Uncommon',
        earnedDate: '2026-07-15T20:00:00Z',
        progress: 7,
        required: 7
      },
      {
        id: 'badge-7',
        name: 'Social Butterfly',
        description: 'Connect with 50 other learners',
        icon: '🦋',
        category: 'Social',
        points: 100,
        rarity: 'Rare',
        earnedDate: null,
        progress: 12,
        required: 50
      },
      {
        id: 'badge-8',
        name: 'Expert Learner',
        description: 'Reach level 10 in any subject',
        icon: '🎓',
        category: 'Mastery',
        points: 150,
        rarity: 'Epic',
        earnedDate: null,
        progress: 8,
        required: 10
      },
      {
        id: 'badge-9',
        name: 'Perfect Score',
        description: 'Get 100% on any assessment',
        icon: '⭐',
        category: 'Excellence',
        points: 200,
        rarity: 'Legendary',
        earnedDate: null,
        progress: 0,
        required: 1
      },
      {
        id: 'badge-10',
        name: 'Mentor',
        description: 'Have 5+ learners follow you',
        icon: '👨‍🏫',
        category: 'Leadership',
        points: 125,
        rarity: 'Epic',
        earnedDate: '2026-07-20T11:30:00Z',
        progress: 5,
        required: 5
      }
    ];

    return NextResponse.json({ data: badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}