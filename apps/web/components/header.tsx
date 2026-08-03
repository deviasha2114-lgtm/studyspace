import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { getSocket } from '@/lib/socket';

export const Header = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('themePreference') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme === 'dark' ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    }
  }, []);

  // Handle theme changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'themePreference') {
        setTheme(e.newValue === 'dark' ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', e.newValue === 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('themePreference', newTheme);

    // Also update user preference in database if logged in
    if (user) {
      axios.put(
        `/api/users/profile/${user.id}`,
        { themePreference: newTheme.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ).catch(err => console.error('Failed to save theme preference:', err));
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNotifications(response.data.data || []);
        const unread = response.data.data?.filter(n => !n.read).length || 0;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Set up real-time notification updates via Socket.io
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = getSocket(token);

    // Listen for new notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for notification updates (marked as read)
    socket.on('notification-read', (notificationId) => {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // Cleanup
    return () => {
      socket.off('notification');
      socket.off('notification-read');
    };
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post(
        `/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post(
        `/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Toggle notification menu
  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    // When opening menu, consider all notifications as viewed (but not necessarily read)
    // In a real app, you might have a separate "viewed" state
  };

  // Close notification menu when clicking outside
  const handleOutsideClick = (e: MouseEvent) => {
    if (isNotificationMenuOpen) {
      setIsNotificationMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isNotificationMenuOpen]);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                StudySpace
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className={`${pathname === '/dashboard' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Dashboard
              </Link>
              <Link
                href="/study-rooms"
                className={`${pathname.startsWith('/study-rooms') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Study Rooms
              </Link>
              <Link
                href="/clubs"
                className={`${pathname.startsWith('/clubs') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Clubs
              </Link>
              <Link
                href="/resources"
                className={`${pathname.startsWith('/resources') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Resources
              </Link>
              <Link
                href="/calendar"
                className={`${pathname.startsWith('/calendar') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Calendar
              </Link>
              <Link
                href="/messages"
                className={`${pathname.startsWith('/messages') ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                         inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              >
                Messages
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 relative">
              {/* Notifications Button */}
              <button
                onClick={toggleNotificationMenu}
                className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 dark:focus:ring-indigo-400"
              >
                <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.023-.595 1.436L4 16h5z"/>
                </svg>
                <span className="ml-2">Notifications</span>
                {/* Badge */}
                {unreadCount > 0 && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotificationMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 dark:bg-gray-700 dark:border-gray-600">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Notifications</p>
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start space-x-3 p-3 ${
                              !notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                            } rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer`}
                            onClick={() => {
                              // Handle notification click (could navigate to relevant page)
                              markAsRead(notification.id);
                              // In a real app, you'd navigate to the relevant page here
                            }}
                          >
                            {/* Notification Icon */}
                            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-200 dark:text-indigo-400">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          >
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-600">
                    <button
                      onClick={markAllAsRead}
                      className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="h-4 w-4 mr-1" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {theme === 'dark' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20 35.5H4a2 2 0 01-2-2V5a2 2 0 012-2h3.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V15a2 2 0 01-2 2H6a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2v-2.586a1 1 0 00-.293-.707l-2.414-2.414a1 1 0 00-.707-.293z"/>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  )}
                </svg>
                <span className="ml-1">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* Profile Dropdown - Simplified for header */}
              <div className="ml-4 relative">
                <button
                  className="flex max-w-xs items-center rounded-full bg-white bg-opacity-0 px-2 py-1 text-sm font-medium text-gray-400 dark:text-gray-400 hover:text-gray-500 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-offset-gray-800 dark:focus:ring-indigo-400"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="ml-2">John Doe</span>
                  <svg className="ml-1 h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Helper function to get notification icon based on type
function getNotificationIcon(type) {
  switch (type) {
    case 'message':
      return '💬';
    case 'study_room':
      return '🏫';
    case 'follow':
      return '👥';
    case 'mention':
      return '@';
    case 'system':
      return '⚙️';
    case 'achievement':
      return '🏆';
    default:
      return '🔔';
  }
}