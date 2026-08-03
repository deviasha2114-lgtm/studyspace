import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get resource ID from URL (in a real app, we'd use Next.js dynamic routes)
    // For now, we'll return mock data based on a hardcoded ID or extract from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const resourceId = pathParts[pathParts.length - 1]; // Last part of the path

    // Mock resource data
    const resource = {
      id: resourceId || '1',
      title: 'Calculus: Early Transcendentals',
      description: 'Standard textbook for single and multivariable calculus covering limits, derivatives, integrals, and series.',
      type: 'book',
      category: 'Mathematics',
      tags: ['calculus', 'textbook', 'reference'],
      difficulty: 'Intermediate',
      estimatedTime: 60, // minutes to read/review
      pages: 1200,
      author: 'James Stewart',
      publisher: 'Cengage Learning',
      publicationDate: '2020-01-01',
      isbn: '978-1337613927',
      createdAt: '2026-06-28T08:00:00Z',
      views: 980,
      downloads: 45,
      rating: 4.9,
      comments: 12,
      content: `This comprehensive textbook covers all aspects of calculus including:

Chapter 1: Functions and Models
- Four ways to represent a function
- Mathematical models
- New functions from old functions
- Graphing calculators and computers

Chapter 2: Limits and Derivatives
- The tangent and velocity problems
- The limit of a function
- Calculating limits using the limit laws
- The precise definition of a limit
- Continuity
- Limits at infinity; horizontal asymptotes
- Derivatives and rates of change
- The derivative as a function

Chapter 3: Differentiation Rules
- Derivatives of polynomials and exponential functions
- The product and quotient rules
- Derivatives of trigonometric functions
- The chain rule
- Implicit differentiation
- Derivatives of logarithmic functions
- Rates of change in the natural and social sciences
- Related rates
- Linear approximation and differentials

Chapter 4: Applications of Differentiation
- Maximum and minimum values
- The mean value theorem
- How derivatives affect the shape of a graph
- Limits at infinity; horizontal asymptotes
- Summary of curve sketching
- Graphing with calculus and calculators
- Optimization problems
- Newton's method
- Antiderivatives

And much more including integration techniques, applications of integration, differential equations, parametric equations, polar coordinates, and infinite series.

This book is widely used in university calculus courses and provides clear explanations, numerous examples, and challenging exercises to help students master calculus concepts.`
    };

    return NextResponse.json({ data: resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}