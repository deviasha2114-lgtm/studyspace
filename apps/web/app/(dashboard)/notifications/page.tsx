import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNotifications(response.data.data || []);

        // Count unread notifications
        const count = (response.data.data || []).filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load notifications'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.post(
        `/api/notifications`,
        { notificationId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the notification locally
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      alert(
        err.response?.data?.message ||
          'Failed to mark notification as read. Please try again.'
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `/api/notifications`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Mark all notifications as read
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      alert(
        err.response?.data?.message ||
          'Failed to mark all notifications as read. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Notifications</span>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="ml-3 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
              {unreadCount} unread
            </span>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your StudySpace activity
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-end space-x-3">
          <button
            onClick={markAllAsRead}
            disabled={loading || unreadCount === 0}
            className={`px-4 py-2 bg-${unreadCount > 0 ? 'indigo-600' : 'gray-300'}
                     text-white font-medium rounded-lg hover:bg-${unreadCount > 0 ? 'indigo-700' : 'gray-400'}
                     disabled:opacity-50`}
          >
            Mark All as Read
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No notifications</p>
            <p className="text-sm text-gray-500 mt-2">
              You'll see updates here when you get new notifications
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  !notification.isRead ? 'border-l-4 border-indigo-500' : 'border-l-4 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      {notification.icon || '🔔'}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.timestamp}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded hover:bg-indigo-100"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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