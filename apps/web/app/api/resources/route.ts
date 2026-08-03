import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // In a real app, this would filter from a database
    // For now, return mock data filtered by category
    const allResources = [
      // Mathematics resources
      {
        id: 'math-1',
        title: 'Calculus: Early Transcendentals',
        description: 'Standard textbook for single and multivariable calculus',
        type: 'book',
        category: 'Mathematics',
        tags: ['calculus', 'textbook', 'reference'],
        difficulty: 'Intermediate',
        estimatedTime: 60,
        createdAt: '2026-06-28T08:00:00Z',
        views: 980,
        rating: 4.9
      },
      {
        id: 'math-2',
        title: 'Linear Algebra and Its Applications',
        description: 'Introduction to linear algebra with applications to engineering and science',
        type: 'book',
        category: 'Mathematics',
        tags: ['linear-algebra', 'matrices', 'vectors'],
        difficulty: 'Intermediate',
        estimatedTime: 45,
        createdAt: '2026-06-25T14:30:00Z',
        views: 720,
        rating: 4.7
      },
      {
        id: 'math-3',
        title: 'Introduction to Probability',
        description: 'Fundamental concepts of probability theory and statistics',
        type: 'article',
        category: 'Mathematics',
        tags: ['probability', 'statistics', 'mathematics'],
        difficulty: 'Beginner',
        estimatedTime: 20,
        createdAt: '2026-07-01T10:15:00Z',
        views: 1250,
        rating: 4.6
      },
      // Science resources
      {
        id: 'sci-1',
        title: 'Organic Chemistry as a Second Language',
        description: 'Translating the basic concepts of organic chemistry',
        type: 'book',
        category: 'Science',
        tags: ['chemistry', 'organic', 'study-guide'],
        difficulty: 'Intermediate',
        estimatedTime: 30,
        createdAt: '2026-06-20T09:00:00Z',
        views: 650,
        rating: 4.8
      },
      {
        id: 'sci-2',
        title: 'Khan Academy Physics Videos',
        description: 'Comprehensive video series covering mechanics, electromagnetism, and more',
        type: 'video',
        category: 'Science',
        tags: ['physics', 'videos', 'lectures'],
        difficulty: 'All Levels',
        estimatedTime: 15,
        createdAt: '2026-07-10T16:45:00Z',
        views: 2100,
        rating: 4.9
      },
      // Programming resources
      {
        id: 'prog-1',
        title: 'Automate the Boring Stuff with Python',
        description: 'Practical programming for total beginners',
        type: 'book',
        category: 'Programming',
        tags: ['python', 'automation', 'beginners'],
        difficulty: 'Begin',
        'estimatedTime': 40,
        'createdAt': '2026-06-15T11:00:00Z',
        'views': 1800,
        'rating': 4.9
      },
      {
        'id': 'prog-2',
        'title': 'clean-code-a-handbook-of-agile-software-craftsmanship',
        'description': 'Classic guide to writing clean, maintainable code',
        'type': 'book',
        'category': 'Programming',
        'tags': ['programming', 'software-engineering', 'best-practices'],
        'difficulty': 'Intermediate',
        'estimatedTime': 35,
        'createdAt': '2026-06-22T13:20:00Z',
        'views': 1100,
        'rating': 4.8
      },
      // Language resources
      {
        'id': 'lang-1',
        'title': 'duolingo-spanish-course',
        'description': 'Interactive language learning platform for Spanish',
        'type': 'link',
        'category': 'Languages',
        'tags': ['language', 'spanish', 'duolingo', 'interactive'],
        'difficulty': 'All Levels',
        'estimatedTime': 10,
        'createdAt': '2026-07-05T09:30:00Z',
        'views': 3200,
        'rating': 4.7
      },
      {
        'id': 'lang-2',
        'title': 'english-grammar-in-use',
        'description': 'Self-study reference and practice book for intermediate learners',
        'type': 'book',
        'category': 'Languages',
        'tags': ['grammar', 'english', 'self-study', 'intermediate'],
        'difficulty': 'Intermediate',
        'estimatedTime': 25,
        'createdAt': '2026-06-18T10:00:00Z',
        'views': 950,
        'rating': 4.6
      }
    ];

    // Filter by category if provided
    let filteredResources = allResources;
    if (category && category !== 'all') {
      filteredResources = allResources.filter(r => r.category === category);
    }

    // Filter by search term if provided
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredResources = filteredResources.filter(r =>
        r.title.toLowerCase().includes(searchTerm) ||
        r.description.toLowerCase().includes(searchTerm) ||
        r.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Limit results
    const limitedResources = filteredResources.slice(0, limit);

    return NextResponse.json({
      data: limitedResources,
      total: filteredResources.length
    });
  } catch (error) {
    console.error('Error filtering resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}