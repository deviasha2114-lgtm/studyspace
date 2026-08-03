import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function FollowersPage({ params }: { params: { userId: string } }) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = params.userId;

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}/followers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowers(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching followers:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load followers'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [user, userId]);

  const followUser = async (followerId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${followerId}/follow`,
        { action: 'follow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the follower's following status in the list
      setFollowers(prev =>
        prev.map(f =>
          f.id === followerId ? { ...f, isFollowing: true, followerCount: (f.followerCount || 0) + 1 } : f
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

  const unfollowUser = async (followerId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/users/${followerId}/follow`,
        { action: 'unfollow' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the follower's following status in the list
      setFollowers(prev =>
        prev.map(f =>
          f.id === followerId ? { ...f, isFollowing: false, followerCount: Math.max(0, (f.followerCount || 0) - 1) } : f
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
            Followers
          </h2>
          {isOwnProfile && (
            <p className="mt-1 text-sm text-gray-500">
              People who follow your learning journey
            </p>
          )}
          {!isOwnProfile && (
            <p className="mt-1 text-sm text-gray-500">
              Followers of this user
            </p>
          )}
        </div>

        {/* Followers List */}
        {followers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No followers yet</p>
            {isOwnProfile ? (
              <p className="text-sm text-gray-500 mt-2">
                Share your profile to gain followers!
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                This user doesn't have any followers yet
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower: any) => (
              <div key={follower.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {follower.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{follower.name}</h3>
                      <div className="text-sm text-gray-500">
                        {follower.isFollowing ? (
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                            Following
                          </span>
                        ) : (
                          <button
                            onClick={() => followUser(follower.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{follower.bio || 'No bio available'}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        {follower.fieldOfStudy || 'Various'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        Level {follower.level || 1}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full">
                        {follower.followerCount?.toLocaleString() || '0'} Followers
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