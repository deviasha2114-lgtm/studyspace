'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function FlashcardsPage() {
  const router = useRouter();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/flashcards');
      setSets(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch flashcard sets:', err);
      setError(err.response?.data?.error || 'Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
    // Check for success message from query params
    if (router.query.studied === '1') {
      setSuccess('Study session saved successfully!');
      // Clear the query param after showing the message
      router.push('/dashboard/flashcards');
    }
  }, [router.query]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard set?')) return;
    try {
      await axios.delete(`/api/flashcards/${id}`);
      setSets(sets.filter(set => set.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete flashcard set');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading flashcard sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Flashcards</h1>
        <Link
          href="/dashboard/flashcards/create"
          className="btn-primary px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Flashcard Set
        </Link>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't created any flashcard sets yet.</p>
          <Link
            href="/dashboard/flashcards/create"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Your First Set
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set: any) => (
            <div key={set.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <span className="text-xl">📇</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{set.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {set.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>{set._count?.flashcards || 0} flashcards</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/dashboard/flashcards/${set.id}`}
                    className="w-full text-left text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Flashcards →
                  </Link>
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="mt-2 w-full text-left text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}