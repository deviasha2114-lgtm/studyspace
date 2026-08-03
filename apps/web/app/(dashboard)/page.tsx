import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 h-48"></div>
              <div className="bg-white rounded-lg shadow p-6 h-48"></div>
              <div className="bg-white rounded-lg shadow p-6 h-48"></div>
              <div className="bg-white rounded-lg shadow p-6 h-48"></div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6 h-24"></div>
                <div className="bg-white rounded-lg shadow p-6 h-24"></div>
                <div className="bg-white rounded-lg shadow p-6 h-24"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="mt-2 text-sm text-gray-500">
            Welcome back, {user?.name || 'Student'}!
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.users?.total || 0}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 7h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2z"/>
              </svg>
              <span className="text-green-600 font-medium">
                {stats?.users?.growthRate || 0}% this month
              </span>
            </div>
          </div>

          {/* Active Today */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-500">Active Today</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.users?.activeToday || 0}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="text-blue-600 font-medium">
                {stats?.users?.activeToday} online now
              </span>
            </div>
          </div>

          {/* Total Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-500">Study Notes</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.engagement?.notes?.total || 0}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-purple-600 font-medium">
                {stats?.engagement?.notes?.createdThisMonth || 0} new this month
              </span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-500">Monthly Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{stats?.revenue?.formatted?.thisMonth || '0.00'}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="text-green-600 font-medium">
                {stats?.revenue?.growthRate || 0}% growth
              </span>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-4 p-6">
              {/* Activity items would go here */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium">S</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Started a new study session
                  </p>
                  <p className="text-sm text-gray-500">
                    2 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex-items-center justify-center">
                    <span className="text-sm font-medium">✓</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Completed a quiz
                  </p>
                  <p className="text-sm text-gray-500">
                    15 minutes ago
                  </p>
                </div>
              }
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Study Streak</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats?.retention?.usersWithStreak || 0} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Average Session</span>
                <span className="text-lg font-semibold text-blue-600">
                  45 min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                <span className="text-lg font-semibold text-purple-600">
                  78%
                </span>
              </div>
            </div>
          </div>

          {/* AI Features Usage */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant Usage</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Questions Asked</span>
                  <span className="text-lg font-semibold text-indigo-600">
                    {stats?.features?.aiSessions?.thisMonth || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Notes Summarized</span>
                  <span className="text-lg font-semibold text-indigo-600">
                    124
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Quizzes Generated</span>
                  <span className="text-lg font-semibold text-indigo-600">
                    89
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}