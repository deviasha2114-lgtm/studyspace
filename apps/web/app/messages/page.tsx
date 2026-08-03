import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';
import ChatUI from '@/components/Chat/ChatUI';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyTo, setReplyTo] = useState<{ messageId: string; content: string; senderName: string } | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [attachmentPickerVisible, setAttachmentPickerVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/messages/conversations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setConversations(response.data.data || []);

        // Auto-select first conversation if available
        if (conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(conversations[0]);
          loadMessagesForConversation(conversations[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load conversations'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, selectedConversation]);

  const loadMessagesForConversation = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const response = await axios.get(`/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Transform the messages to match the expected format for ChatUI
      const transformedMessages = response.data.data.map((msg: any) => ({
        id: msg.id,
        userId: msg.senderId,
        username: msg.senderName,
        content: msg.content,
        timestamp: new msg.Date(msg.createdAt),
        type: msg.type || 'text',
        attachments: msg.attachments || [],
        replyTo: msg.replyTo ? {
          messageId: msg.replyTo,
          content: msg.replyToContent || '',
          senderName: msg.replyToSenderName || ''
        } : undefined,
        reactions: msg.reactions ? JSON.parse(msg.reactions) : []
      }));
      setMessages(transformedMessages);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async (content: string, attachments: any[], replyToId?: string) => {
    if (!user || !selectedConversation || (!content.trim() && attachments.length === 0)) return;

    try {
      await axios.post(
        `/api/messages/${selectedConversation.id}`,
        {
          content: content.trim(),
          attachments,
          replyTo: replyToId,
          type: 'text',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Clear input and reload messages
      setNewMessage('');
      setAttachments([]);
      setReplyTo(null);
      loadMessagesForConversation(selectedConversation.id);
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerVisible(false);
  };

  const handleAttachmentChange = (newAttachments: any[]) => {
    setAttachments(newAttachments);
    setAttachmentPickerVisible(false);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Messages</span>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            {/* Content will be rendered below */}
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

  return (
    <ErrorBoundary fallback={<div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center"><p className="text-red-500 text-center">Something went wrong. Please try again later.</p></div>}>
      <div className="min-h-screen bg-gray-50 py-12">
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 11h3m4-3H7m0 11h10m4-3v-3M8 13h3M8 17h3M8 21h3"/>
            </svg>
            Messages
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stay connected with classmates and instructors
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-[600px]">
          {/* Conversations List */}
          <div className="w-64 flex-shrink-0 border-r border-gray-200">
            <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
              <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                <span className="text-xl font-bold">💬</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Conversations</h3>
                <p className="text-sm text-gray-500">
                  {conversations.length} active
                </p>
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 11h3m4-3H7m0 11h10m4-3v-3M8 13h3M8 17h3M8 21h3"/>
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-900">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start a conversation by reaching out to a classmate or instructor
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2 p-4">
                  {conversations.map((convo: any) => (
                    <div
                      key={convo.id}
                      onClick={() => {
                        setSelectedConversation(convo);
                        loadMessagesForConversation(convo.id);
                      }}
                      className={`cursor-pointer p-3 rounded-lg ${
                        selectedConversation?.id === convo.id
                          ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {convo.otherUserName?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium text-gray-900">{convo.otherUserName}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {convo.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {convo.unreadCount > 0 && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600 ml-2"></span>
                          )}
                          <span className="text-xs">
                            {convo.lastMessageTime ?
                              new Date(convo.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                              'Recent'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages View */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col border-l border-gray-200">
              {/* Conversation Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedConversation(null);
                      setMessages([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Conversations
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {selectedConversation.otherUserName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.otherUserName}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.isOnline ? 'Online' : 'Offline'}
                        {selectedConversation.isOnline ? (
                          <span className="ml-1 h-2 w-2 rounded-full bg-green-500"></span>
                        ) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Placeholder for call feature
                        alert('Video call feature coming soon!');
                      }}
                      className="p-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                    >
                      <span className="text-xl">📹</span>
                    </button>
                    <button
                      onClick={() => {
                        // Placeholder for voice call
                        alert('Voice call feature coming soon!');
                      }}
                      className="p-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                    >
                      <span className="text-xl">📞</span>
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                      {user && (
                        <button
                          onClick={() => {
                            // Placeholder for starting conversation
                            alert('Start conversation feature coming soon!');
                          }}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                        >
                          Send First Message
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message: any, index: number) => {
                        const isOwnMessage = message.senderId === user.id;
                        return (
                          <div key={index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`max-w-[80%] ${isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg px-4 py-2`}
                                 >
                              <div className="flex items-center space-x-2 mb-1">
                                {!isOwnMessage && (
                                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                                    {message.senderName?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )}
                                <span className="font-medium">{isOwnMessage ? 'You' : message.senderName}</span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <span className="text-xs text-gray-500 block mt-1">
                                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    }
                  </div>
                </div>

                {/* Message Input */}
                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setAttachmentPickerVisible(true)}
                      className="p-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                    >
                      <span className="text-xl">📎</span>
                    </button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 min-h-[44px] pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(newMessage, attachments, replyTo?.messageId);
                        }
                      }}
                    ></textarea>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() && attachments.length === 0 || loading}
                      className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 11h3m4-3H7m0 11h10m4-3v-3M8 13h3M8 17h3M8 21h3"/>
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900">Select a conversation to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
      </div>
    </ErrorBoundary>
  );
}