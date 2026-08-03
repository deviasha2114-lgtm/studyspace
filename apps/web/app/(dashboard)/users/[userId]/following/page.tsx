import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function FollowingPage({ params }: { params: { userId: string } }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = params.userId;

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}/following`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowing(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching following:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load following'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [user, userId]);

  const followUser = async (followedId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${followedId}/follow`,
        { action: 'follow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the followed user's follower count in the list
      setFollowing(prev =>
        prev.map(f =>
          f.id === followedId ? { ...f, followerCount: (f.followerCount || 0) + 1 } : f
        )
      );

      // Also update current user's following status if they're in the list
      setFollowing(prev =>
        prev.map(f =>
          f.id === user.id ? { ...f, isFollowing: true } : f
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

  const unfollowUser = async (followedId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${followedId}/follow`,
        { action: 'unfollow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the followed user's follower count in the list
      setFollowing(prev =>
        prev.map(f =>
          f.id === followedId ? { ...f, followerCount: Math.max(0, (f.followerCount || 0) - 1) } : f
        )
      );

      // Also update current user's following status if they're in the list
      setFollowing(prev =>
        prev.map(f =>
          f.id === user.id ? { ...f, isFollowing: false } : f
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

  const isOwnProfile = user && user.id === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Following
          </h2>
          {isOwnProfile && (
            <p className="mt-1 text-sm text-gray-500">
              Users you're following on your learning journey
            </p>
          )}
          {!isOwnProfile && (
            <p className="mt-1 text-sm text-gray-500">
              Users this person is following
            </p>
          )}
        </div>

        {/* Following List */}
        {following.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">Not following anyone yet</p>
            {isOwnProfile ? (
              <p className="text-sm text-gray-500 mt-2">
                Start following people to see their activity here
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                This user isn't following anyone yet
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((followed: any) => (
              <div key={followed.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {followed.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{followed.name}</h3>
                      <div className="text-sm text-gray-500">
                        {followed.isFollowing ? (
                          <button
                            onClick={() => unfollowUser(followed.id)}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => followUser(followed.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{followed.bio || 'No bio available'}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        {followed.fieldOfStudy || 'Various'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        Level {followed.level || 1}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        {followed.followerCount?.toLocaleString() || '0'} Followers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Profile Link */}
        <div className="mt-8 text-center">
          <Link
            href={isOwnProfile ? `/dashboard/profile` : `/dashboard/users/${userId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}