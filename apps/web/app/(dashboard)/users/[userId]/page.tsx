import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const userId = params.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProfile(response.data.data);

        // Check if current user is following this user
        const followsResponse = await axios.get(
          `/api/users/${user.id}/following/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setIsFollowing(followsResponse.data.data?.isFollowing || false);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load user profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userId]);

  const toggleFollow = async () => {
    if (!user) return;

    try {
      const response = await axios.post(
        `/api/users/${userId}/follow`,
        {
          action: isFollowing ? 'unfollow' : 'follow',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setIsFollowing(!isFollowing);
    } catch (err: any) {
      console.error('Error following/unfollowing user:', err);
      alert(
        err.response?.data?.message ||
          'Failed to update follow status. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Loading Profile...</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Profile</span>
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
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">User not found</h3>
            <p className="text-sm text-gray-500 mt-2">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Actions */}
        <div className="mb-6 flex justify-between items-start flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
          {!isOwnProfile && (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFollow}
                disabled={loading}
                className={`px-4 py-2 bg-${isFollowing ? 'gray-600' : 'indigo-600'} text-white font-medium rounded-lg hover:bg-${isFollowing ? 'gray-700' : 'indigo-700'} disabled:opacity-50`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={() => {
                  // Placeholder for message functionality
                  alert('Message feature coming soon!');
                }}
                className="px-4 py-2 bg-indigo-100 text-indigo-800 font-medium rounded hover:bg-indigo-200"
              >
                Message
              </button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {profile.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  Member since {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full">
                  Level {profile.level || 1}
                </span>
              </div>
              <p className="text-gray-600">{profile.bio || 'No bio available.'}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span>🎯 {profile.totalPoints || 0} Points</span>
                <span>🔥 {profile.dailyStreak || 0} Day Streak</span>
                <span>🏆 {profile.achievementsCount || 0} Achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Followers</h3>
              <Link
                href={`/dashboard/users/${userId}/followers`}
                className="block"
              >
                <p className="text-2xl font-bold text-indigo-600">{profile.followerCount || 0}</p>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Following</h3>
              <Link
                href={`/dashboard/users/${userId}/following`}
                className="block"
              >
                <p className="text-2xl font-bold text-indigo-600">{profile.followingCount || 0}</p>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Study Streak</h3>
              <p className="text-2xl font-bold text-emerald-600">{profile.studyStreak || 0} days</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {([
              {
                icon: '📚',
                title: 'Completed Algebra Quiz',
                description: 'Scored 95% on quadratic equations quiz',
                timestamp: '2 hours ago'
              },
              {
                icon: '💬',
                title: 'Joined Physics Study Group',
                description: 'Started discussing Newton\'s laws',
                timestamp: 'Yesterday'
              },
              {
                icon: '🏆',
                title: 'Earned Helper Badge',
                description: 'Helped 5 peers with their questions',
                timestamp: '3 days ago'
              }
            ] as const).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
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