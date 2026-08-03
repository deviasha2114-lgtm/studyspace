import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/notification-preferences', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPreferences(response.data.data || null);
      } catch (err: any) {
        console.error('Error fetching notification preferences:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load notification preferences'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await axios.put(
        '/api/notification-preferences',
        {
          email: preferences.email,
          push: preferences.push,
          inApp: preferences.inApp
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successMsg.textContent = 'Preferences saved successfully!';
      document.body.appendChild(successMsg);

      // Remove after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving notification preferences:', err);
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorMsg.textContent =
        err.response?.data?.message || 'Failed to save preferences. Please try again.';
      document.body.appendChild(errorMsg);

      // Remove after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMsg);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (type: string, category: string) => {
    if (!preferences) return;

    const newPreferences = {
      ...preferences,
      [type]: {
        ...preferences[type],
        [category]: !preferences[type][category]
      }
    };

    setPreferences(newPreferences);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Notification Preferences</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </span>
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

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-gray-400 mb-4">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No preferences found</h3>
            <p className="text-sm text-gray-500 mt-2">
              Unable to load notification preferences at the moment.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3"/>
                </svg>
              </div>
            </div>
            <div>
              Notification Preferences
            </div>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Customize how you receive notifications from StudySpace
          </p>
        </div>

        {/* Preferences Form */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }} className="space-y-6">
          {/* Email Notifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                Email Notifications
              </div>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Follower</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.newFollower}
                    onChange={(e) => handleToggle('email', 'newFollower')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.newFollower ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Study Room Invite</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.studyRoomInvite}
                    onChange={(e) => handleToggle('email', 'studyRoomInvite')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.studyRoomInvite ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Message</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.newMessage}
                    onChange={(e) => handleToggle('email', 'newMessage')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.newMessage ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Mention</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.mention}
                    onChange={(e) => handleToggle('email', 'mention')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.mention ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Achievement Earned</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.achievementEarned}
                    onChange={(e) => handleToggle('email', 'achievementEarned')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.achievementEarned ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Weekly Digest</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.weeklyDigest}
                    onChange={(e) => handleToggle('email', 'weeklyDigest')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.weeklyDigest ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Promotional Offers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email.promotional}
                    onChange={(e) => handleToggle('email', 'promotional')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.email.promotional ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Push Notifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                Push Notifications
              </div>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Follower</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.newFollower}
                    onChange={(e) => handleToggle('push', 'newFollower')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.newFollower ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Study Room Invite</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.studyRoomInvite}
                    onChange={(e) => handleToggle('push', 'studyRoomInvite')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.studyRoomInvite ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Message</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.newMessage}
                    onChange={(e) => handleToggle('push', 'newMessage')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.newMessage ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Mention</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.mention}
                    onChange={(e) => handleToggle('push', 'mention')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.mention ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Achievement Earned</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.achievementEarned}
                    onChange={(e) => handleToggle('push', 'achievementEarned')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.achievementEarned ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Weekly Digest</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.weeklyDigest}
                    onChange={(e) => handleToggle('push', 'weeklyDigest')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.weeklyDigest ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Promotional Offers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.push.promotional}
                    onChange={(e) => handleToggle('push', 'promotional')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.push.promotional ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* In-App Notifications */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3"/>
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                In-App Notifications
              </div>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Follower</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.newFollower}
                    onChange={(e) => handleToggle('inApp', 'newFollower')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.newFollower ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Study Room Invite</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.studyRoomInvite}
                    onChange={(e) => handleToggle('inApp', 'studyRoomInvite')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.studyRoomInvite ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">New Message</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.newMessage}
                    onChange={(e) => handleToggle('inApp', 'newMessage')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.newMessage ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Mention</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.mention}
                    onChange={(e) => handleToggle('inApp', 'mention')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.mention ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Achievement Earned</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.achievementEarned}
                    onChange={(e) => handleToggle('inApp', 'achievementEarned')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.achievementEarned ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Weekly Digest</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.weeklyDigest}
                    onChange={(e) => handleToggle('inApp', 'weeklyDigest')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.weeklyDigest ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">Promotional Offers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inApp.promotional}
                    onChange={(e) => handleToggle('inApp', 'promotional')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600">
                    <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-[transform] duration-200 ease-in-out"
                         style={{ transform: preferences.inApp.promotional ? 'translateX(5)' : 'translateX(0)' }}></div>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </form>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 shadow-md"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}