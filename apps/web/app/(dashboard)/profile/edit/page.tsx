import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    themePreference: 'SYSTEM' as 'LIGHT' | 'DARK' | 'SYSTEM',
    emailNotifications: true,
    pushNotifications: true,
    newsletter: false
  });

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
        const profile = response.data.data || {};

        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          themePreference: profile.themePreference || 'SYSTEM',
          emailNotifications: profile.emailNotifications !== undefined ? profile.emailNotifications : true,
          pushNotifications: profile.pushNotifications !== undefined ? profile.pushNotifications : true,
          newsletter: profile.newsletter !== undefined ? profile.newsletter : false
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(
        `/api/users/profile/${user.id}`,
        {
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Profile updated successfully!');

      // Update auth context if name changed
      if (formData.name !== user.name) {
        // In a real app, we'd update the token or refetch user data
        // For now, we'll just note that the name has changed in the UI
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Editing Profile</span>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form will be rendered below */}
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Edit Profile
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Update your account information and preferences
          </p>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>

            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us a little about yourself..."
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences</h3>

            <div className="space-y-3">
              <label htmlFor="themePreference" className="block text-sm font-medium text-gray-700 mb-2">
                Theme Preference
              </label>
              <select
                id="themePreference"
                name="themePreference"
                value={formData.themePreference}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="SYSTEM">System Default</option>
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Choose your preferred color theme. System Default follows your OS settings.
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive email updates about your activities and platform news
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    id="pushNotifications"
                    name="pushNotifications"
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="pushNotifications" class="text-sm font-medium text-gray-700">
                    Push Notifications
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Get browser notifications for important updates
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="newsletter" class="text-sm font-medium text-gray-700">
                    Monthly Newsletter
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Subscribe to our monthly newsletter with study tips and updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Back to Profile Link */}
        <div className="mt-6 text-center">
          <Link
            href="/dashboard/profile"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}