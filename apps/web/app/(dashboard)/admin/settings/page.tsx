import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    siteName: 'StudySpace',
    siteDescription: 'The ultimate learning community platform',
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    maintenanceMode: false,
    allowGuestAccess: false
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      // Redirect non-admins to dashboard
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user || user.role !== 'ADMIN') return;

      try {
        setLoading(true);
        const response = await axios.get('/api/admin/settings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setSettings(response.data.data || settings);
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load settings'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: e.target.checked
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
        `/api/admin/settings`,
        {
          ...settings
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Settings saved successfully!');
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading Settings...</h2>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading settings...</span>
          </div>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            ← Back to Admin Dashboard
          </Link>
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
            {/* Form would be rendered here */}
          </form>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3"/>
                </svg>
              </div>
            </div>
            <div>
              System Settings
            </div>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Configure platform settings and features
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-sm">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-lg p-8">
          {/* Basic Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus-ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus-ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Settings</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onChange={(e) => handleCheckboxChange(e, 'registrationEnabled')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="registrationEnabled" className="text-sm font-medium text-gray-700">
                    Allow New Registrations
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Enable or disable user registration
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="emailVerificationRequired"
                    checked={settings.emailVerificationRequired}
                    onChange={(e) => handleCheckboxChange(e, 'emailVerificationRequired')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="emailVerificationRequired" className="text-sm font-medium text-gray-700">
                    Require Email Verification
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Users must verify email before accessing account
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="allowGuestAccess"
                    checked={settings.allowGuestAccess}
                    onChange={(e) => handleCheckboxChange(e, 'allowGuestAccess')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="allowGuestAccess" className="text-sm font-medium text-gray-700">
                    Allow Guest Access
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Allow users to browse content without signing up
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">File Upload Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  name="maxFileSize"
                  value={settings.maxFileSize}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus-ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum size for uploaded files
                </p
              </div>
            </div>
          </div>

          {/* System Maintenance */}
          <div className="mb-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Maintenance</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleCheckboxChange(e, 'maintenanceMode')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 mt-0.5">
                  <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                    Enable Maintenance Mode
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Temporarily disable non-essential features for maintenance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}