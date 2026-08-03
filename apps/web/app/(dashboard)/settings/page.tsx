import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    themePreference: 'SYSTEM', // LIGHT, DARK, SYSTEM
    email: {
      newFollower: true,
      studyRoomInvite: true,
      newMessage: true,
      mention: true,
      achievementEarned: true,
      weeklyDigest: true,
      promotional: false
    },
    push: {
      newFollower: true,
      studyRoomInvite: true,
      newMessage: true,
      mention: true,
      achievementEarned: true,
      weeklyDigest: false,
      promotional: false
    },
    inApp: {
      newFollower: true,
      studyRoomInvite: true,
      newMessage: true,
      mention: true,
      achievementEarned: true,
      weeklyDigest: true,
      promotional: false
    }
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/users/settings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Assuming the API returns settings in response.data.settings
        const settings = response.data.settings || {};

        // Merge with defaults to ensure all fields are present
        setFormData({
          themePreference: settings.themePreference || 'SYSTEM',
          email: {
            ...formData.email,
            ...(settings.email || {})
          },
          push: {
            ...formData.push,
            ...(settings.push || {})
          },
          inApp: {
            ...formData.inApp,
            ...(settings.inApp || {})
          }
        });
      } catch (err) {
        console.error('Error fetching user settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;

    // Handle nested object updates
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(
        `/api/users/settings`,
        {
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Settings saved successfully!');
      // Update localStorage immediately for theme preference
      if (formData.themePreference) {
        localStorage.setItem('themePreference', formData.themePreference);
        // Trigger theme update via dispatching a storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'themePreference',
          newValue: formData.themePreference
        }));
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save settings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Theme Preference</span>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form will be rendered below */}
          </form>
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
                    d="M12 8v4l3 3"/>
            </svg>
            Settings
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Customize your StudySpace experience
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
          {/* Theme Preference */}
          <div>
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

          {/* Notification Preferences */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            <p className="mb-4 text-sm text-gray-500">
              Customize how you receive notifications for different activities
            </p>

            {/* Email Notifications */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-newFollower"
                      name="email.newFollower"
                      type="checkbox"
                      checked={formData.email.newFollower}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-newFollower" className="text-sm font-medium text-gray-700">
                      New Follower
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone follows you
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-studyRoomInvite"
                      name="email.studyRoomInvite"
                      type="checkbox"
                      checked={formData.email.studyRoomInvite}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-studyRoomInvite" className="text-sm font-medium text-gray-700">
                      Study Room Invite
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you're invited to a study room
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-newMessage"
                      name="email.newMessage"
                      type="checkbox"
                      checked={formData.email.newMessage}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-newMessage" className="text-sm font-medium text-gray-700">
                      New Message
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you receive a new message
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-mention"
                      name="email.mention"
                      type="checkbox"
                      checked={formData.email.mention}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-mention" className="text-sm font-medium text-gray-700">
                      Mention
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone mentions you in a comment or post
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-achievementEarned"
                      name="email.achievementEarned"
                      type="checkbox"
                      checked={formData.email.achievementEarned}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-achievementEarned" className="text-sm font-medium text-gray-700">
                      Achievement Earned
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you earn a new badge or achievement
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-weeklyDigest"
                      name="email.weeklyDigest"
                      type="checkbox"
                      checked={formData.email.weeklyDigest}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-weeklyDigest" className="text-sm font-medium text-gray-700">
                      Weekly Digest
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Weekly summary of your study activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="email-promotional"
                      name="email.promotional"
                      type="checkbox"
                      checked={formData.email.promotional}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="email-promotional" className="text-sm font-medium text-gray-700">
                      Promotional Offers
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Special offers and promotions from StudySpace
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Push Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-newFollower"
                      name="push.newFollower"
                      type="checkbox"
                      checked={formData.push.newFollower}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-newFollower" className="text-sm font-medium text-gray-700">
                      New Follower
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone follows you
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-studyRoomInvite"
                      name="push.studyRoomInvite"
                      type="checkbox"
                      checked={formData.push.studyRoomInvite}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-studyRoomInvite" className="text-sm font-medium text-gray-700">
                      Study Room Invite
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you're invited to a study room
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-newMessage"
                      name="push.newMessage"
                      type="checkbox"
                      checked={formData.push.newMessage}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-newMessage" className="text-sm font-medium text-gray-700">
                      New Message
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you receive a new message
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-mention"
                      name="push.mention"
                      type="checkbox"
                      checked={formData.push.mention}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-mention" className="text-sm font-medium text-gray-700">
                      Mention
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone mentions you in a comment or post
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-achievementEarned"
                      name="push.achievementEarned"
                      type="checkbox"
                      checked={formData.push.achievementEarned}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-achievementEarned" className="text-sm font-medium text-gray-700">
                      Achievement Earned
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you earn a new badge or achievement
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-weeklyDigest"
                      name="push.weeklyDigest"
                      type="checkbox"
                      checked={formData.push.weeklyDigest}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-weeklyDigest" className="text-sm font-medium text-gray-700">
                      Weekly Digest
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Weekly summary of your study activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="push-promotional"
                      name="push.promotional"
                      type="checkbox"
                      checked={formData.push.promotional}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="push-promotional" className="text-sm font-medium text-gray-700">
                      Promotional Offers
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Special offers and promotions from StudySpace
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">In-App Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-newFollower"
                      name="inApp.newFollower"
                      type="checkbox"
                      checked={formData.inApp.newFollower}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-newFollower" className="text-sm font-medium text-gray-700">
                      New Follower
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone follows you
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-studyRoomInvite"
                      name="inApp.studyRoomInvite"
                      type="checkbox"
                      checked={formData.inApp.studyRoomInvite}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-studyRoomInvite" className="text-sm font-medium text-gray-700">
                      Study Room Invite
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you're invited to a study room
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-newMessage"
                      name="inApp.newMessage"
                      type="checkbox"
                      checked={formData.inApp.newMessage}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-newMessage" className="text-sm font-medium text-gray-700">
                      New Message
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you receive a new message
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-mention"
                      name="inApp.mention"
                      type="checkbox"
                      checked={formData.inApp.mention}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-mention" className="text-sm font-medium text-gray-700">
                      Mention
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When someone mentions you in a comment or post
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-achievementEarned"
                      name="inApp.achievementEarned"
                      type="checkbox"
                      checked={formData.inApp.achievementEarned}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-achievementEarned" className="text-sm font-medium text-gray-700">
                      Achievement Earned
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      When you earn a new badge or achievement
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-weeklyDigest"
                      name="inApp.weeklyDigest"
                      type="checkbox"
                      checked={formData.inApp.weeklyDigest}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-weeklyDigest" className="text-sm font-medium text-gray-700">
                      Weekly Digest
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Weekly summary of your study activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <input
                      id="inApp-promotional"
                      name="inApp.promotional"
                      type="checkbox"
                      checked={formData.inApp.promotional}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 mt-0.5">
                    <label htmlFor="inApp-promotional" className="text-sm font-medium text-gray-700">
                      Promotional Offers
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Special offers and promotions from StudySpace
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

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