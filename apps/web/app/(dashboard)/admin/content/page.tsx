import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function AdminContent() {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      // Redirect non-admins to dashboard
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!user || user.role !== 'ADMIN') return;

      try {
        setLoading(true);
        const response = await axios.get('/api/admin/content', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setContent(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching content:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load content'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading Content...</h2>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading content...</span>
          </div>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <Link
            href="/admin"
            className="mb-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div>
              Content Moderation
            </div>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review and manage user-generated content
          </p>
        </div>

        {content.length > 0 ? (
          <div className="space-y-4">
            {content.map((item: any, index: number) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                      <span className="text-sm font-medium text-amber-600">
                        {item.type || '•'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-2 py-0.5 rounded-full
                        ${item.priority === 'high' ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'}">
                        {item.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full
                        ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : item.status === 'approved' ? 'bg-green-100 text-green-800'
                          : item.status === 'rejected' ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'}">
                        {item.status?.toUpperCase() || 'PENDING'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // Placeholder for approve action
                          alert(`Approved: ${item.title}`);
                        }}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          // Placeholder for reject action
                          alert(`Rejected: ${item.title}`);
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No content awaiting moderation</p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}