import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function ClubPage({ params }: { params: { clubId: string } }) {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState([]);
  const clubId = params.clubId;

  useEffect(() => {
    const fetchClub = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/clubs/${clubId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setClub(response.data.data);
        setIsMember(response.data.data.isMember || false);

        // Fetch recent posts/activity for the club
        const postsResponse = await axios.get(`/api/clubs/${clubId}/posts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPosts(postsResponse.data.data || []);
      } catch (err: any) {
        console.error('Error fetching club details:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load club details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [user, clubId]);

  const joinClub = async () => {
    if (!user) return;

    try {
      await axios.post(
        `/api/clubs/${clubId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsMember(true);
      // Refresh club data to update member count
      const response = await axios.get(`/api/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClub(response.data.data);
    } catch (err: any) {
      console.error('Error joining club:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to join club'
      );
    }
  };

  const leaveClub = async () => {
    if (!user) return;

    try {
      await axios.post(
        `/api/clubs/${clubId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsMember(false);
      // Refresh club data to update member count
      const response = await axios.get(`/api/clubs/${clubId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setClub(response.data.data);
    } catch (err: any) {
      console.error('Error leaving club:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to leave club'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Loading Club...</h2>
            <Link href="/clubs" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Clubs
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading club details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Club</h2>
            <Link href="/clubs" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Clubs
            </Link>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Club</h2>
            <Link href="/clubs" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Clubs
            </Link>
          </div>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Club not found</h3>
            <p className="text-sm text-gray-500 mt-2">
              The club you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/clubs"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Back to Clubs
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
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  {getClubIcon(club.category)}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{club.name}</h1>
                <p className="text-sm text-gray-500">
                  {club.category} • {club.memberCount} members
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isMember ? (
                <button
                  onClick={leaveClub}
                  disabled={loading}
                  className={`px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50`}
                >
                  Leave Club
                </button>
              ) : (
                <button
                  onClick={joinClub}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Join Club
                </button>
              )}
              <Link
                href="/clubs"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Clubs
              </Link>
            </div>
          </div>

          {club.description && (
            <p className="text-gray-600 mb-4">{club.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {club.category}
            </span>
            <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
              {club.memberCount} members
            </span>
            {club.isPrivate && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Private
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 pb-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`${activeTab === 'posts' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`${activeTab === 'members' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
            >
              Members
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">About this Club</h3>
              <p className="text-gray-600">{club.description || 'No description available.'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Members</p>
                <p className="text-2xl font-bold text-indigo-600">{club.memberCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Posts</p>
                <p className="text-2xl font-bold text-indigo-600">{posts.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Active Today</p>
                <p className="text-2xl font-bold text-indigo-600">{Math.floor(club.memberCount * 0.3)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No posts yet. Be the first to start a discussion!</p>
                {isMember && (
                  <button
                    onClick={() => alert('Create post feature coming soon!')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Create Post
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {post.authorName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{post.authorName}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-gray-600">{post.content}</p>
                        <div className="mt-3 flex items-center space-x-3 text-sm">
                          <span className="text-indigo-600">👍 {post.likes}</span>
                          <span className="text-indigo-600">💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Members</h3>
              <span className="text-sm text-gray-500">{club.memberCount} members</span>
            </div>
            <div className="space-y-3">
              {/* Mock member list */}
              {[1, 2, 3, 4, 5].map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {String.fromCharCode(65 + index)} {/* A, B, C, D, E */}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Member {index + 1}</p>
                    <p className="text-sm text-gray-500">Active today</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => alert('Send message feature coming soon!')}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full hover:bg-indigo-200"
                    >
                      Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/clubs"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Clubs
          </Link>
        </div>
      </div>
    </div>
  );
}

// State for tab selection
let activeTab = 'overview';

// Helper function to get club icon based on category
function getClubIcon(category: string) {
  switch (category) {
    case 'STEM':
      return '🔬';
    case 'Humanities':
      return '📚';
    case 'Languages':
      return '💬';
    case 'Arts':
      return '🎨';
    case 'Professional':
      return '💼';
    case 'Hobbies':
      return '🎯';
    default:
      return '👥';
  }
}