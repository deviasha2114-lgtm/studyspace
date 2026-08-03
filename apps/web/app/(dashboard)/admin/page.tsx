import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      // Redirect non-admins to dashboard
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || user.role !== 'ADMIN') return;

      try {
        setLoading(true);

        // Fetch platform statistics
        const statsResponse = await axios.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Fetch recent users
        const usersResponse = await axios.get('/api/admin/recent-users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Fetch recent activity
        const activityResponse = await axios.get('/api/admin/recent-activity', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setStats(statsResponse.data.data || {});
        setRecentUsers(usersResponse.data.data || []);
        setRecentActivity(activityResponse.data.data || []);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Loading...</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3"/>
                  </svg>
                </div>
              </div>
              <div>
                Admin Dashboard
              </div>
            </h1>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Overview of platform activity and management tools
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <span className="text-blue-600">👥</span>
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalUsers || 0}
              </p>
              <p className="text-sm text-gray-500">
                {(stats.userGrowth || 0) > 0
                  ? `▲ {stats.userGrowth}% this month`
                  : `▼ ${Math.abs(stats.userGrowth || 0)}% this month`}
              </p>
            </div>

            {/* Active Today */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <span className="text-green-600">⚡</span>
                Active Today
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeToday || 0}
              </p>
              <p className="text-sm text-gray-500">
                {((stats.activeToday || 0) / Math.max(stats.totalUsers || 1, 1) * 100).toFixed(1)}% of users
              </p>
            </div>

            {/* Study Rooms */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <span className="text-purple-600">🏠</span>
                Study Rooms
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalRooms || 0}
              </p>
              <p className="text-sm text-gray-500">
                {stats.activeRooms || 0} active
              </p>
            </div>

            {/* Messages Sent */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
                <span className="text-orange-600">💬</span>
                Messages Sent
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {stats.totalMessages?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-500">
                {(stats.messagesToday || 0).toLocaleString()} today
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="text-indigo-600">📄</span>
              Recent Activity
            </h2>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.icon || '•'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span className="text-green-600">👥</span>
              Recent Users
            </h2>
          </div>

          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user: any, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800'
                            : user.role === 'PREMIUM' ? 'bg-purple-100 text-purple-800'
                            : user.role === 'PRO' ? 'bg-blue-100 text-blue-800'
                            : user.role === 'BASIC' ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'}">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent users
            </div
          )}
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/admin/users" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-gray-50">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-7 7h14a7 7 0 01-7-7z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage all platform users
                  </p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/content" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-gray-50">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Content Moderation</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and manage user-generated content
                  </p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/settings" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-gray-50">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">System Settings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure platform settings and features
                  </p>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}