import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import Link from 'next/link';

interface Friend {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

interface FriendsListProps {
  onFriendClick?: (friendId: string) => void;
}

export const FriendsList = ({ onFriendClick }: FriendsListProps = {}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/friend/friends', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Assuming the response is an array of friend objects with user data
      setFriends(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load friends list'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      await axios.delete(`/api/friend/${friendId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Remove friend from list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (err: any) {
      // In a real app, you might want to show a notification
      console.error('Failed to remove friend:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span className="text-gray-500">Loading friends...</span>
        </div>
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

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You have no friends yet. Start connecting with others!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="font-medium text-gray-900">Friends</h3>
        <span className="text-sm text-gray-500">{friends.length} friends</span>
      </div>
      <div className="space-y-3">
        {friends.map((friend: Friend) => (
          <div
            key={friend.id}
            onClick={() => onFriendClick?.(friend.id)}
            className={`cursor-pointer flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors
              ${onFriendClick ? '' : 'border'}`}
          >
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              {friend.avatarUrl ? (
                <img
                  src={friend.avatarUrl}
                  alt={`${friend.name}'s avatar`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-indigo-600 font-medium">
                  {friend.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">{friend.name}</h4>
                {friend.username && (
                  <span className="text-xs text-gray-500">@{friend.username}</span>
                )}
              </div>
              {!onFriendClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the onClick on the div
                    handleRemoveFriend(friend.id);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};