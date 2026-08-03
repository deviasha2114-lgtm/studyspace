import { useAuth } from '@/context/AuthContext';
import { useState, useRouter } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function CreateStudyRoomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'OPEN', // OPEN, PRIVATE, SUBJECT, BATCH, FOCUS
    maxParticipants: 5,
    scheduledDate: '',
    scheduledTime: '',
    duration: 60, // in minutes
    isPublic: true,
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Combine date and time for scheduledAt
      let scheduledAt: string | undefined;
      if (formData.scheduledDate && formData.scheduledTime) {
        scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      const response = await axios.post(
        `/api/study-rooms`,
        {
          ...formData,
          scheduledAt,
          scheduledDate: undefined,
          scheduledTime: undefined,
          // Remove empty password if room is public
          ...(!formData.isPublic && formData.password ? { password: formData.password } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Redirect to the newly created room
      router.push(`/study-rooms/${response.data.data.id}`);
    } catch (err: any) {
      console.error('Error creating study room:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create study room. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Study Room</h2>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Creating your study room...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Study Room</h2>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form will be rendered below */}
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/study-rooms"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Back to Study Rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3"/>
            </svg>
            Create Study Room
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Set up a new study session for you and your peers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Room Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter study room title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe what this study room is about"
            />
          </div>

          {/* Room Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="OPEN">Open 🔓 (Anyone can join)</option>
              <option value="PRIVATE">Private 🔒 (Password required)</option>
              <option value="SUBJECT">Subject Focused 📚</option>
              <option value="BATCH">Batch Session 👥</option>
              <option value="FOCUS">Focus Mode 🎯</option>
            </select>
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Participants
              </label>
              <input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="2"
                max="100"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration (minutes)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date (Optional)
              </label>
              <input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time (Optional)
              </label>
              <input
                id="scheduledTime"
                name="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Visibility & Password */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 mt-0.5">
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this room public (discoverable in search)
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Public rooms appear in search results and can be joined by anyone.
                </p>
              </div>
            </div>

            {/* Password field (only for private rooms) */}
            {!formData.isPublic && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Password (for private rooms)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter a password for private access"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Only required for private rooms. Share this password with intended participants.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Study Room'}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/study-rooms"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Study Rooms
          </Link>
        </div>
      </div>
    </div>
  );
}