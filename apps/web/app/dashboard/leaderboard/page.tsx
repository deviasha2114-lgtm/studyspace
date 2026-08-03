import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overall' | 'weekly' | 'monthly'>('overall');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/leaderboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setLeaderboard(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load leaderboard'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Leaderboard</span>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setTab('overall')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${tab === 'overall' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Overall
              </button>
              <button
                onClick={() => setTab('weekly')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${tab === 'weekly' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTab('monthly')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${tab === 'monthly' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            See how you rank against other learners in the StudySpace community
          </p>
        </div>

        {/* User's Position */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">🏆</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Your Position</h3>
                <p className="text-sm text-gray-500">Based on total points</p>
              </div>
            </div>
            <div className="text-right space-x-2">
              <div className="text-2xl font-bold text-indigo-600">
                {user ? (
                  <span>#{leaderboard.find((u: any) => u.userId === user.id)?.rank ?? '--'}</span>
                ) : (
                  <span>#--</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {user ? (
                  <span>{leaderboard.find((u: any) => u.userId === user.id)?.points?.toLocaleString() ?? '0'} Points</span>
                ) : (
                  <span>0 Points</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Learners</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {leaderboard.map((userData: any, index: number) => {
              const isCurrentUser = user && user.id === userData.userId;
              return (
                <div
                  key={userData.userId}
                  className={`px-6 py-4 flex items-center justify-between ${isCurrentUser ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full">
                        {userData.rank <= 3 ? (
                          <>
                            {userData.rank === 1 && '🥇'}
                            {userData.rank === 2 && '🥈'}
                            {userData.rank === 3 && '🥉'}
                          </>
                        ) : (
                          <span className="text-gray-500 font-medium">{userData.rank}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded-full">
                          {userData.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userData.name}</p>
                          <p className="text-sm text-gray-500">Level {userData.level}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      <div className="space-y-1 text-right">
                        <p className="font-medium text-gray-900">{userData.points?.toLocaleString() ?? '0'}</p>
                        <p className="text-sm text-gray-500">Points</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="font-medium text-gray-900">{userData.streak}</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="font-medium text-gray-900">{userData.badgesCount}</p>
                        <p className="text-sm text-gray-500">Badges</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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