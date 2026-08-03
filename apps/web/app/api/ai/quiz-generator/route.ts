import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, difficulty = 'medium', count = 5 } = await request.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // In a real implementation, this would generate quiz questions using AI
    // For now, we'll return mock questions
    const questions = Array.from({ length: parseInt(count) }, (_, i) => {
      const questionTypes = [
        'multiple_choice',
        'true_false',
        'short_answer',
        'fill_in_the_blank'
      ];
      const type = questionTypes[i % questionTypes.length];

      let question = '';
      let options = [];
      let correctAnswer = '';

      switch (type) {
        case 'multiple_choice':
          question = `What is a key concept related to ${topic}?`;
          options = [
            `Option A: A fundamental principle of ${topic}`,
            `Option B: An incorrect statement about ${topic}`,
            `Option C: Another incorrect statement about ${topic}`,
            `Option D: The correct answer about ${topic}`
          ];
          correctAnswer = 'D';
          break;
        case 'true_false':
          question = `True or False: ${topic} is an important subject to study.`;
          correctAnswer = 'True';
          break;
        case 'short_answer':
          question = `Briefly explain why ${topic} is important in your field of study.`;
          break;
        case 'fill_in_the_blank':
          question = `The most important aspect of ${topic} is ______.`;
          correctAnswer = 'understanding its core principles';
          break;
      }

      return {
        id: `q${i + 1}`,
        type,
        question,
        options: options.length > 0 ? options : undefined,
        correctAnswer: correctAnswer || 'Sample answer',
        explanation: `This question tests understanding of ${topic} fundamentals.`
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}