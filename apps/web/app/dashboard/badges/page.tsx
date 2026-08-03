import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function BadgesPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/badges', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setBadges(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching badges:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load badges'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return badge.earnedDate !== null;
    if (filter === 'locked') return badge.earnedDate === null;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Badges</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Your Badges</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Your Badges</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('earned')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'earned' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Earned
              </button>
              <button
                onClick={() => setFilter('locked')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'locked' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Locked
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Collect badges by completing learning milestones, participating in the community, and achieving your goals.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Badges</h3>
            <p className="text-2xl font-bold text-indigo-600">{badges.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Earned Badges</h3>
            <p className="text-2xl font-bold text-emerald-600">{badges.filter(b => b.earnedDate !== null).length}</p>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-6">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              {filter === 'earned' ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No earned badges yet</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Keep learning and engaging with the community to earn your first badge!
                  </p>
                </>
              ) : filter === 'locked' ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">All badges earned!</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    You've collected all available badges. Keep an eye out for new challenges!
                  </p>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No badges found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Unable to load badges at the moment.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBadges.map((badge: any) => (
                <div key={badge.id} className={`group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full">
                          {badge.earnedDate ? (
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                              {badge.icon}
                            </div>
                          ) : (
                            <div className="bg-gray-200 text-gray-500">
                              {badge.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-medium text-gray-900 ${badge.earnedDate ? '' : 'opacity-75'}`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-500">{badge.description}</p>
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full">
                        {badge.rarity}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">{badge.points}</span>
                        <span className="text-gray-500">points</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className={`bg-${badge.earnedDate ? 'green-500' : 'gray-400'} h-2.5 rounded-full`}
                             style={{ width: `${Math.min((badge.progress / badge.required) * 100, 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-gray-500">
                        <span>{badge.progress}/{badge.required}</span>
                        <span>{Math.round((badge.progress / badge.required) * 100)}%</span>
                      </div>
                    </div>

                    {badge.earnedDate ? (
                      <div className="text-xs text-green-600 mb-3">
                        Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mb-3">
                        Locked - Keep progressing to unlock!
                      </div>
                    )}

                    <div className="mt-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${badge.earnedDate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {badge.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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