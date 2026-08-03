import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function FollowingPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${user.id}/following`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowing(response.data.data || []);
      } catch (err: any) {
        console.error('Error loading following:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load following'
        );
      } finally {
        setLoading(false);
      }
    };

    loadFollowing();
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
      setFollowing(prev =>
        prev.map(person =>
          person.id === userId
            ? { ...person, isFollowing: true }
            : person
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
      setFollowing(prev =>
        prev.map(person =>
          person.id === userId
            ? { ...person, isFollowing: false }
            : person
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
              <h2 className="text-2xl font-bold text-gray-900">Following</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Following</span>
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
                    d="M17 21h2a2 2 0 002-2V5a2 2 0 00-2-2h-5l-4 4-4-4H5a2 2 0 00-2 2v14a2 2 0 002 2h2"/>
            </svg>
            Following
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            People you're following on your learning journey
          </p>
        </div>

        {/* Following List */}
        {following.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 17h6m-6 5h6m6-5h6m-6-5h6"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">Not following anyone yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Discover people to follow and grow your learning network
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((person: any) => (
              <div key={person.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      {person.avatar ? (
                        <img
                          src={person.avatar}
                          alt={`${person.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-indigo-100 text-indigo-600">
                          {person.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{person.name}</p>
                        <p className="text-sm text-gray-500">
                          {person.bio || 'No bio yet'}
                        </p>
                      </div>
                      <div className="space-x-2">
                        {person.isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(person.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded hover:bg-gray-300"
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(person.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {person.followersCount} followers • {person.followingCount} following
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