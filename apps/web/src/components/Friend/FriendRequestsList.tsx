import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  toUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface FriendRequestsListProps {
  type?: 'received' | 'sent'; // 'received' by default
}

export const FriendRequestsList = ({ type = 'received' }: FriendRequestsListProps) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const params = type === 'sent' ? '?type=sent' : '';
      const response = await axios.get(`/api/friend/requests${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Handle both formats: direct array or {sent: [...], received: [...]}
      if (Array.isArray(response.data)) {
        setRequests(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setRequests(type === 'sent' ? (response.data.sent || []) : (response.data.received || []));
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load friend requests'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await axios.put(`/api/friend/request/${requestId}/respond`, { action }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove the request from the list
      setRequests(prev => req => req.filter(r => r.id !== requestId));
    } catch (err: any) {
      // In a real app, you might want to show a notification or inline error
      console.error('Failed to respond to friend request:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, type]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading friend requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const requestsToShow = type === 'sent' ? requests : requests;

  if (requestsToShow.length === 0) {
    const message = type === 'sent'
      ? 'You haven\'t sent any friend requests yet.'
      : 'You have no pending friend requests.';

    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">
        {type === 'sent' ? 'Sent Requests' : 'Friend Requests'}
      </h3>
      <div className="space-y-3">
        {requestsToShow.map((request: FriendRequest) => {
          const otherUser = type === 'sent' ? request.toUser : request.fromUser;

          // Fallback if user data not included
          const userName = otherUser?.name || 'Unknown User';
          const userAvatar = otherUser?.avatarUrl ||
            (otherUser?.name ? otherUser.name.charAt(0).toUpperCase() : '?');

          return (
            <div key={request.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                {typeof userAvatar === 'string' && userAvatar.length === 1 ? (
                  <span className="text-indigo-600 font-medium">{userAvatar}</span>
                ) : (
                  <img
                    src={userAvatar as string}
                    alt={`${userName}'s avatar`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{userName}</h4>
                  <span className="text-xs text-gray-500">
                    {/* Format date */}
                    {new Date(request.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {type === 'sent'
                    ? `You sent a friend request to ${userName}`
                    : `${userName} sent you a friend request`}
                </p>
                {type === 'received' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleRespond(request.id, 'accept')}
                      className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(request.id, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};