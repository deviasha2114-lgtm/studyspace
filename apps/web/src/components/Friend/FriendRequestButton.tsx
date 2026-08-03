import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

interface FriendRequestButtonProps {
  userId: string; // The user to send request to
  onSuccess?: () => void;
}

export const FriendRequestButton = ({ userId, onSuccess }: FriendRequestButtonProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSendRequest = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/friend/request/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSent(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to send friend request'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <button
        disabled
        className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600"
      >
        Request Sent
      </button>
    );
  }

  return (
    <button
      onClick={handleSendRequest}
      disabled={loading || !user}
      className={`px-3 py-1 text-xs font-medium rounded transition-colors
        ${loading || !user ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
        : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
    >
      {loading ? 'Sending...' : 'Add Friend'}
    </button>
    {error && (
      <p className="mt-1 text-xs text-red-500">{error}</p>
    )}
  );
};