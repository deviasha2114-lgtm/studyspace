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
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    // In a real app, this would query a database for events in the date range
    // For now, return mock calendar events
    const events = [
      {
        id: 'evt-1',
        title: 'Midterm Exam - Calculus II',
        description: 'Covering chapters 4-6: integration techniques and applications',
        date: '2026-08-15',
        time: '9:00 AM - 11:00 AM',
        location: 'Room 205, Science Building',
        type: 'exam',
        priority: 'high'
      },
      {
        id: 'evt-2',
        title: 'Study Group - Organic Chemistry',
        description: 'Reviewing functional groups and reaction mechanisms',
        date: '2026-08-10',
        time: '3:00 PM - 5:00 PM',
        location: 'Library Room 3B',
        type: 'study-group',
        priority: 'medium'
      },
      {
        id: 'evt-3',
        title: 'Assignment Due: Physics Problem Set',
        description: 'Newton\'s laws and kinematics problems',
        date: '2026-08-12',
        time: '11:59 PM',
        type: 'assignment',
        priority: 'high'
      },
      {
        id: 'evt-4',
        title: 'Literature Club Meeting',
        description: 'Discussing Shakespeare\'s sonnets and their modern interpretations',
        date: '2026-08-18',
        time: '6:00 PM - 7:30 PM',
        location: 'Student Union, Room 204',
        type: 'meeting',
        priority: 'low'
      },
      {
        id: 'evt-5',
        title: 'Research Paper Draft Due',
        description: 'First draft of environmental science research paper',
        date: '2026-08-20',
        time: '11:59 PM',
        location: 'Submit via LMS',
        type: 'deadline',
        priority: 'high'
      },
      {
        id: 'evt-6',
        title: 'Group Project Meeting',
        description: 'Final preparation for presentation',
        date: '2026-08-25',
        time: '2:00 PM - 4:00 PM',
        location: 'Conference Room A',
        type: 'meeting',
        priority: 'medium'
      },
      {
        id: 'evt-7',
        title: 'Final Exam - World History',
        description: 'Comprehensive exam covering all semester material',
        date: '2026-08-30',
        time': '8:00 AM - 11:00 AM',
        location: 'Gymnasium',
        type: 'exam',
        priority: 'high'
      },
      {
        id: 'evt-8',
        title: 'Spring Break',
        description: 'No classes - university closed',
        date: '2026-03-15',
        time: 'All Day',
        type: 'holiday',
        priority: 'low'
      }
    ];

    // Filter by date range if provided
    let filteredEvents = events;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    return NextResponse.json({ data: filteredEvents });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, date, time, location, type } = await request.json();

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    // In a real app, this would save to a database
    // For now, return success with mock data
    const newEvent = {
      id: `evt-${Date.now()}`,
      title,
      description: description || '',
      date,
      time: time || 'All day',
      location: location || '',
      type: type || 'event',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(
      {
        message: 'Event created successfully',
        data: newEvent
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}