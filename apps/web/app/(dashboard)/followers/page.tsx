import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function FollowersPage() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowers = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${user.id}/followers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowers(response.data.data || []);
      } catch (err: any) {
        console.error('Error loading followers:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load followers'
        );
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, [user]);

  const handleFollow = async (userId: string) => {
    try {
      await axios.post(
        `/api/users/${userId}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Optimistically update the UI
      setFollowers(prev =>
        prev.map(follower =>
          follower.id === userId
            ? { ...follower, isFollowing: true }
            : follower
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

  const handleUnfollow = async (userId: string) => {
    try {
      await axios.delete(`/api/users/${userId}/follow`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Optimistically update the UI
      setFollowers(prev =>
        prev.map(follower =>
          follower.id === userId
            ? { ...follower, isFollowing: false }
            : follower
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
              <h2 className="text-2xl font-bold text-gray-900">Followers</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Followers</span>
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14 9l-3 3m0 0l-3-3m3 3h4h-4m4 4v-3.01a1 1 0 00-.35-.863A8.002 8.002 11 0 015 9c-2.34 0-4.34 1.67-5.12 4A5.972 5.972 0 009 19c2.24 0 4.24-.58 5.76-1.57a2.03 2.03 0 001.37-.656A8.943 8.943 0 0115 9h4M14 9v5m0 0h4m-4 0h4"/>
            </svg>
            Followers
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            People who follow your learning journey
          </p>
        </div>

        {/* Followers List */}
        {followers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No followers yet</p>
            <p className="text-sm text-gray-500 mt-2">
              When people follow you, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower: any) => (
              <div key={follower.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      {follower.avatar ? (
                        <img
                          src={follower.avatar}
                          alt={`${follower.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-indigo-100 text-indigo-600">
                          {follower.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{follower.name}</p>
                        <p className="text-sm text-gray-500">
                          {follower.bio || 'No bio yet'}
                        </p>
                      </div>
                      <div className="space-x-2">
                        {follower.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(follower.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded hover:bg-gray-300"
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(follower.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {follower.followersCount} followers • {follower.followingCount} following
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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