import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/users/discover', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: { search: searchTerm }
        });
        setUsers(response.data.data || []);
      } catch (err: any) {
        console.error('Error discovering users:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load users'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, searchTerm]);

  const followUser = async (userId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${userId}/follow`,
        { action: 'follow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the user's following status in the list
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 } : u
        )
      );
    } catch (err: any) {
      console.error('Error following user:', err);
      alert(
        err.response?.data?.message ||
          'Failed to follow user. Please try again.'
      );
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${userId}/follow`,
        { action: 'unfollow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the user's following status in the list
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, isFollowing: false, followerCount: Math.max(0, (u.followerCount || 0) - 1) }
            : u
        )
      );
    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      alert(
        err.response?.data?.message ||
          'Failed to unfollow user. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Discover Users</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Discover Users</span>
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
            Discover Users
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Find and connect with fellow learners
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or interests..."
            className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No users found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((userData: any) => (
              <div key={userData.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {userData.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{userData.name}</h3>
                      <div className="text-sm text-gray-500">
                        {userData.isFollowing ? (
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                            Following
                          </span>
                        ) : (
                          <button
                            onClick={() => followUser(userData.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{userData.bio || 'No bio available'}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        {userData.fieldOfStudy || 'Various'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        Level {userData.level || 1}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        {userData.followerCount?.toLocaleString() || '0'} Followers
                      </span>
                    </div>
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