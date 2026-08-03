import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function StudyRoomsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studyRooms, setStudyRooms] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudyRooms = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/study-rooms`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: { search: searchTerm }
        });
        setStudyRooms(response.data.data || []);
      } catch (err) {
        setError('Failed to load study rooms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyRooms();
  }, [user, searchTerm]);

  if (loading) return <div className="p-8">Loading study rooms...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 12h14M5 19h14M5 7h14"/>
            </svg>
            Study Rooms
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join or create study sessions with fellow learners
          </p>
        </div>

        {/* Search and Create Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <label htmlFor="search" className="sr-only">Search study rooms</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.636 17.364l2.768 2.768"/>
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search study rooms..."
                className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Link
            href="/study-rooms/create"
            className="inline-flex items-center px-4 py-2 bg-border text-sm font-medium text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="me-2 h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v16m8-8H4"/>
            </svg>
            Create Study Room
          </Link>
        </div>

        {/* Study Rooms Grid */}
        <div className="space-y-6">
          {studyRooms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No study rooms found</h3>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or create a new study room to get started.
              </p>
              <Link
                href="/study-rooms/create"
                className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
              >
                Create Your First Room
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studyRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/study-rooms/${room.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            {room.type === 'OPEN' ? '🔓' : room.type === 'PRIVATE' ? '🔒' : '📚'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{room.title}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {room.description || 'No description available'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              {room.currentParticipants}/{room.maxParticipants}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {room.type}
                            </span>
                            {room.isPublic && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                Public
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-500">
            Showing {studyRooms.length} of {studyRooms.length} study rooms
          </span>
          <div className="flex space-x-2">
            <button
              disabled
              className="px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"
            >
              Previous
            </button>
            <button
              disabled
              className="ml-2 px-3 py-1 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}