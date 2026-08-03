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

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // In a real implementation, this would summarize text using AI
    // For now, we'll return a mock summary
    const wordCount = content.trim().split(/\s+/).length;
    const summary = `
**Summary of Provided Text** (${wordCount} words → ~${Math.max(30, Math.round(wordCount * 0.3))} words)

The provided text discusses "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}". Here are the key points:

1. **Main Topic**: The text primarily focuses on the subject matter introduced at the beginning.

2. **Key Concepts**: Several important ideas are presented throughout the content, each building upon the previous to create a coherent understanding of the topic.

3. **Supporting Details**: Examples, evidence, or explanations are provided to reinforce the main points.

4. **Conclusions**: The text concludes with specific takeaways or recommendations related to the topic.

**Study Tips for This Material**:
- Create flashcards for key terms and concepts
- Explain the material in your own words to check understanding
- Connect new information to what you already know
- Practice applying the concepts to hypothetical scenarios
- Review the material periodically to improve retention

This summary was generated using AI-powered text summarization technology. For best results with longer or more technical texts, consider breaking the content into smaller sections and summarizing each part individually.
    `.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}