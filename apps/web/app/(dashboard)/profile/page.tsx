import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function OwnProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/profile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">?</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Loading...</p>
                <p className="text-sm text-gray-500">Loading profile...</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-500">Study Streak</p>
                <p className="text-2xl font-bold text-indigo-600">0 days</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-500">Level</p>
                <p className="text-2xl font-bold text-emerald-600">1</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-500">Points</p>
                <p className="text-2xl font-bold text-amber-600">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <p className="font-medium">{error}</p>
        <p className="mt-2">Please try again later or contact support if the issue persists.</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No profile data found</p>
        <p className="mt-2">This might be your first time visiting the profile page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {profileData.user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {profileData.user?.name || 'Anonymous'}
          </h3>
          <p className="text-sm text-gray-500">
            {profileData.user?.email || 'No email'}
          </p>
          <p className="text-sm text-gray-500">
            Member since {new Date(profileData.user?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="h-5 w-5 text-yellow-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5h6a2 2 0 012 2v11a7 7 0 01-14 0V7a2 2 0 012-2zm0 0l2 2m-2-2l-2 2m2 2l2 2m-2-2l-2 2m2 2l2 2m-2-2l-2 2"/>
          </svg>
          Gamification & Progress
        </h2>

        {/* Level Progress */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Level {profileData.user?.level || 1}</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                 style={{ width: `${profileData.user?.xpPercentage || 0}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{profileData.user?.currentXP || 0} XP</span>
            <span>{profileData.user?.xpToNextLevel || 100} XP to next level</span>
          </div>
        </div>

        {/* Points and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">📊</span>
              </div>
            </div>
            <p className="text-lg font-bold text-indigo-600">{profileData.user?.totalPoints || 0}</p>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">🔥</span>
              </div>
            </div>
            <p className="text-lg font-bold text-emerald-600">{profileData.user?.dailyStreak || 0}</p>
            <p className="text-sm text-gray-500">Day Streak</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">🏆</span>
              </div>
            </div>
            <p className="text-lg font-bold text-amber-600">{profileData.user?.achievementsCount || 0}</p>
            <p className="text-sm text-gray-500">Achievements</p>
          </div>
        </div>

        {/* Achievements Badges */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Earned Badges */}
            {profileData.user?.achievements?.map((badge: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border hover:shadow">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded-full">
                    {badge.icon || '🏆'}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{badge.name}</p>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                </div>
              </div>
            ))}

            {/* Locked Badges (showing as locked) */}
            {[{
                name: 'Knowledge Seeker',
                description: 'Complete your first lesson',
                icon: '📚',
                unlocked: false
              },
              {
                name: 'Discussion Starter',
                description: 'Start 10 discussions',
                icon: '💬',
                unlocked: false
              },
              {
                name: 'Helper',
                description: 'Help 5 peers with their questions',
                icon: '🤝',
                unlocked: false
              }].map((badge: any, index: number) => (
              <div key={`locked-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg shadow-sm border-l-4 border-gray-300 opacity-75">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
                    {badge.icon || '🔒'}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-600 line-through">{badge.name}</p>
                  <p className="text-xs text-gray-400 line-through">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {profileData.user?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                    {activity.icon || '📝'}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>
          <div className="space-y-2">
            {/* Top Users */}
            {[{
                rank: 1,
                name: 'Alex Chen',
                points: 2450,
                level: 12,
                avatar: 'A'
              },
              {
                rank: 2,
                name: 'Sam Rivera',
                points: 2180,
                level: 11,
                avatar: 'S'
              },
              {
                rank: 3,
                name: 'Taylor Kim',
                points: 1950,
                level: 10,
                avatar: 'T'
              },
              {
                rank: 4,
                name: 'You',
                points: profileData.user?.totalPoints || 0,
                level: profileData.user?.level || 1,
                avatar: profileData.user?.name?.charAt(0).toUpperCase() || 'U',
                isCurrentUser: true
              }].map((user: any, index: number) => (
              <div key={index} className={`flex items-center space-x-3 p-3 ${user.isCurrentUser ? 'bg-indigo-50' : 'bg-white'} rounded-lg shadow-sm`}>
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                    <span className="font-bold">{user.rank}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-indigo-600">{user.points} pts</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="pt-4">
        <Link
          href="/dashboard/profile/edit"
          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}