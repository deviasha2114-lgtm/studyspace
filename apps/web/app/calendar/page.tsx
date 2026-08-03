import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter } from 'date-fns';

export default function CalendarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/calendar/events', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            start: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
            end: format(endOfMonth(currentDate), 'yyyy-MM-dd')
          }
        });
        setEvents(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching calendar events:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load calendar events'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, currentDate]);

  const prevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const prevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const nextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const prevDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const nextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setView('day');
  };

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Get weeks for month view
  React.useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Adjust to start from Sunday
    const startOfWeek = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endOfWeek = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: startOfWeek, end: endOfWeek });

    setCalendarDays(allDays);
  }, [currentDate]);

  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Calendar</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
            {/* Content will be rendered below */}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const monthName = format(currentDate, 'MMMM yyyy');
  const weekRange = `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`;
  const dayName = format(currentDate, 'EEEE, MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              Calendar
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your schedule and academic deadlines
            </p>
          </div>
          <div className="flex items-space-x-3">
            <button
              onClick={view === 'month' ? prevMonth : view === 'week' ? prevWeek : prevDay}
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
            >
              Previous
            </button>
            <div className="flex-1 text-center">
              {view === 'month' ? monthName : view === 'week' ? weekRange : dayName}
            </div>
            <button
              onClick={view === 'month' ? nextMonth : view === 'week' ? nextWeek : nextDay}
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 text-xs"
            >
              Next
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-4 border-b border-gray-200 pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('month')}
              className={`${view === 'month' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} px-4 py-2`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`${view === 'week' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} px-4 py-2`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`${view === 'day' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} px-4 py-2`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {/* Weekdays Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="text-center font-medium text-gray-600 bg-white px-3 py-2">
                {day}
              </div>
            ))}

            {/* Days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              const dayEvents = getDayEvents(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`cursor-pointer flex flex-col items-start p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    !isCurrentMonth ? 'text-gray-300' : ''
                  } ${isToday ? 'border-2 border-indigo-500' : ''} ${isSelected ? 'bg-indigo-50' : ''}`}
                >
                  <div className="w-full flex justify-between mb-1">
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                    )}
                  </div>
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div key={idx} className="w-2 h-2 bg-green-600 rounded-full"></div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-2 h-2 bg-green-600 rounded-full">
                      <span className="text-xs text-white">{dayEvents.length - 3}+</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'week' && (
            <div className="space-y-4">
              {/* Week Header */}
              <div className="flex space-x-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="flex-1 text-center font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2">
                {eachDayOfInterval({
                  start: startOfWeek(currentDate, { weekStartsOn: 0 }),
                  end: endOfWeek(currentDate, { weekStartsOn: 0 })
                }).map((date, index) => {
                  const isToday = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, selectedDate);
                  const dayEvents = getDayEvents(date);

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`cursor-pointer flex flex-col items-start p-3 rounded-lg border hover:bg-gray-50 transition-colors ${
                        isToday ? 'border-2 border-indigo-500' : ''
                      } ${isSelected ? 'bg-indigo-50' : ''}`}
                    >
                      <div className="w-full flex justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">{format(date, 'd')}</span>
                          {isToday && (
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                              Today
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">{format(date, 'EEE')}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        {dayEvents.map((event, idx) => (
                          <div key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm flex justify-between">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-xs">{event.time || 'All day'}</span>
                          </div>
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="text-center text-xs text-gray-400 py-2">
                            No events
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'day' && (
            <div className="space-y-6">
              {/* Day Header */}
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-gray-900">
                  {format(selectedDate, 'EEEE')}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {format(selectedDate, 'MMM d, yyyy')}
                </div>
              </div>

              {/* Events List */}
              {getDayEvents(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getDayEvents(selectedDate).map((event, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.description || 'No description available'}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>⏰ {event.time || 'All day'}</span>
                          {event.location && (
                            <>
                              <span>📍</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                        {event.type && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded">
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No events scheduled for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  <button
                    onClick={() => {
                      // Placeholder for creating event
                      alert('Create event feature coming soon!');
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                  >
                    + Add Event
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Event */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add Event</h3>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            // Placeholder for form submission
            alert('Event created successfully!');
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={format(selectedDate, 'yyyy-MM-dd')}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Room 205, Library, Online"
                  className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter event details..."
              ></textarea>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Create Event
              </button>
              <button
                type="button"
                onClick={() => {
                  // Reset form
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </div>
            </form>
          </div>
        </div>

        {/* Back to Dashboard Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper function to get event icon
function getEventIcon(type: string | undefined) {
  switch (type?.toLowerCase()) {
    case 'class':
      return '📚';
    case 'exam':
      return '📝';
    case 'assignment':
      return '✏️';
    case 'meeting':
      return '👥';
    case 'study-group':
      return '👨‍🎓👩‍🎓';
    case 'deadline':
      return '⏰';
    case 'holiday':
      return '🎉';
    default:
      return '📅';
  }
}

// Import date-fns functions (these would normally be imported at the top)
// For this example, we're defining them here to avoid import issues
function subMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - amount, date.getDate());
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

function subWeeks(date: Date, amount: number): Date {
  return new Date(date.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
}

function addWeeks(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
}

function subDays(date: Date, amount: number): Date {
  return new Date(date.getTime() - amount * 24 * 60 * 60 * 1000);
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000);
}

function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}