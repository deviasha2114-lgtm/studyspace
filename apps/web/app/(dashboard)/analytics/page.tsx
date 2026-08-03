import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || user.role !== 'ADMIN') {
        // Redirect non-admins to dashboard
        window.location.href = '/dashboard';
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Redirect non-admin users
  if (user && user.role !== 'ADMIN') {
    return <div>Redirecting to dashboard...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="animate-pulse">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 h-24"></div>
              <div className="bg-white rounded-lg shadow p-6 h-24"></div>
              <div className="bg-white rounded-lg shadow p-6 h-24"></div>
              <div className="bg-white rounded-lg shadow p-6 h-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {data.users.total}
          </p>
          <p className="text-sm text-gray-500">
            {data.users.newThisMonth} new this month ({data.users.growthRate}%)
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Active Today</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.users.activeToday}
          </p>
          <p className="text-sm text-gray-500">
            {data.users.activeThisWeek} active this week
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Study Notes</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.engagement.notes.total}
          </p>
          <p className="text-sm text-gray-500">
            {data.engagement.notes.createdThisMonth} new this month
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-emerald-600">
            ₹{data.revenue.formatted.thisMonth}
          </p>
          <p className="text-sm text-gray-500">
            {data.revenue.growthRate}% vs last month
          </p>
        </div>
      </div>

      {/* Charts Section (Placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth Trend</h3>
          <div className="h-48 bg-gray-200 rounded-lg">
            {/* Chart would go here */}
            <div className="flex h-full items-center justify-center text-gray-500">
              User Growth Chart
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Metrics</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span>Notes Created</span>
              <span>{data.engagement.notes.total}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span>Study Rooms</span>
              <span>{data.engagement.studyRooms.total}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span>Messages Sent</span>
              <span>{data.engagement.messages.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retention & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Retention</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Users with Active Streak</span>
              <span className="font-medium">{data.retention.usersWithStreak}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Retention Rate</span>
              <span className="font-medium">{data.retention.streakPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>AI Sessions (Total)</span>
              <span className="font-medium">{data.features.aiSessions.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>AI Sessions (This Month)</span>
              <span className="font-medium">{data.features.aiSessions.thisMonth}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}