import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function ClubsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Array<any>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchClubs = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/clubs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setClubs(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching clubs:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load clubs'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const joinClub = async (clubId: string) => {
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
      // Refetch clubs to update member count and user's membership status
      fetchClubs();
      alert(`Successfully joined ${clubId}!`);
    } catch (err: any) {
      console.error('Error joining club:', err);
      alert(
        err.response?.data?.message ||
          'Failed to join club. Please try again.'
      );
    }
  };

  const leaveClub = async (clubId: string) => {
    if (!user || !window.confirm('Are you sure you want to leave this club?')) return;

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
      // Refetch clubs to update member count and user's membership status
      fetchClubs();
      alert('Successfully left the club.');
    } catch (err: any) {
      console.error('Error leaving club:', err);
      alert(
        err.response?.data?.message ||
          'Failed to leave club. Please try again.'
      );
    }
  };

  // Filter clubs based on search and category
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || club.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Clubs</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Clubs</span>
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Clubs</h2>
            {/* Content will be rendered below */}
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.516.516 0 01-.354.146l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L11 9.414V6a1 1 0 100-2v3.414l1.146-1.146a.5.5 0 01.708 0l1.5 1.5a.5 5 0 01-.708.708z"/>
            </svg>
            Clubs
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Join communities to collaborate and learn together
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="mb-3 sm:mb-0">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search clubs by name or description..."
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:self-end">
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="STEM">STEM</option>
                <option value="Humanities">Humanities</option>
                <option value="Languages">Languages</option>
                <option value="Arts">Arts</option>
                <option value="Professional">Professional</option>
                <option value="Hobbies">Hobbies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.516.516 0 01-.354.146l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L11 9.414V6a1 1 0 100-2v3.414l1.146-1.146a.5.5 0 01.708 0l1.5 1.5a.5 5 0 01-.708.708z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No clubs found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map(club => (
              <div key={club.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      {getClubIcon(club.category)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{club.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{club.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {club.category}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                        {club.memberCount} members
                      </span>
                      {club.isPrivate && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => user.isMember ? leaveClub(club.id) : joinClub(club.id)}
                        disabled={loading}
                        className={`px-4 py-2 bg-${user.isMember ? 'gray-600' : 'indigo-600'} text-white font-medium rounded-lg hover:bg-${user.isMember ? 'gray-700' : 'indigo-700'} disabled:opacity-50`}
                      >
                        {user.isMember ? 'Leave Club' : 'Join Club'}
                      </button>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
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