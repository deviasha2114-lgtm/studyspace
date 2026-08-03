"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import axios from '@/lib/axios';
import ChatMessageComposer from './ChatMessageComposer';
import EmojiPicker from './EmojiPicker';
import AttachmentPicker from './AttachmentPicker';
import ReplyIndicator from './ReplyIndicator';
import AttachmentPreview from './AttachmentPreview';

export interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type?: string;
  attachments?: any[];
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  reactions?: Array<{ userId: string; emoji: string; createdAt: string }>;
}

interface ChatUIProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string, attachments: any[], replyTo?: string) => void;
  isConnected: boolean;
  channelName?: string;
}

export function ChatUI({
  messages,
  currentUserId,
  onSendMessage,
  isConnected,
  channelName = "general"
}: ChatUIProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<{
    messageId: string;
    content: string;
    senderName: string;
  } | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket.IO event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for reaction updates
    socket.on('chat:reactionAdded', (data: any) => {
      // Update the message with new reaction
      setMessages(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { userId: data.userId, emoji: data.emoji, createdAt: new Date().toISOString() }]
          };
        }
        return msg;
      }));
    });

    socket.on('chat:reactionRemoved', (data: any) => {
      // Remove reaction from message
      setMessages(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          return {
            ...msg,
            reactions: msg.reactions?.filter(r => !(r.userId === data.userId && r.emoji === data.emoji)) || []
          };
        }
        return msg;
      }));
    });

    // Cleanup
    return () => {
      socket.off('chat:reactionAdded');
      socket.off('chat:reactionRemoved');
    };
  }, [socket, isConnected, messages, setMessages]);

  const handleSend = () => {
    onSendMessage(
      selectedEmoji || '',
      attachments,
      replyTo ? replyTo.messageId : undefined
    );

    // Reset form
    setSelectedEmoji('');
    setAttachments([]);
    setReplyTo(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentChange = (newAttachments: any[]) => {
    setAttachments(newAttachments);
    setShowAttachmentPicker(false);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleStartReply = (message: Message) => {
    setReplyTo({
      messageId: message.id,
      content: message.content,
      senderName: message.username
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <span className="font-semibold text-gray-200"># {channelName}</span>
        <span
          className={`ml-auto w-2 h-2 rounded-full ${
            isConnected ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"
          }`}
        />
        <span className="text-xs text-gray-400">
          {isConnected ? "Live" : "Connecting..."}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Say hello!
          </p>
        )}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="relative">
              {/* Reply indicator */}
              {msg.replyTo && (
                <ReplyIndicator
                  messageId={msg.replyTo.messageId}
                  content={msg.replyTo.content}
                  senderName={msg.replyTo.senderName}
                  onCancel={handleCancelReply}
                />
              )}

              {/* Message container */}
              <div className={`flex gap-3 ${
                msg.userId === currentUserId ? "flex-row-reverse" : ""
              }`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {msg.username[0].toUpperCase()}
                </div>

                {/* Message content */}
                <div className={`max-w-[70%] ${
                  msg.userId === currentUserId ? "items-end" : "items-start"
                } flex flex-col gap-1`}>
                  {/* Message header */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-gray-300">
                      {msg.username}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Message content with attachments */}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.userId === currentUserId
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-gray-800 text-gray-100 rounded-tl-sm"
                  }`}>
                    {msg.content}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att: any, index: number) => (
                          <AttachmentPreview
                            key={index}
                            attachment={att}
                            onRemove={() => {
                              // In a real app, you'd update the message to remove the attachment
                              console.log(`Remove attachment ${index}`);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(
                        msg.reactions.reduce((acc: any, reaction: any) => {
                          const key = reaction.emoji;
                          if (!acc[key]) acc[key] = { count: 0, users: [] };
                          acc[key].count++;
                          acc[key].users.push(reaction.userId);
                          return acc;
                        }, {})
                      ).map(([emoji, data]: [string, any]) => (
                        <div
                          key={`${msg.id}-${emoji}-${data.count}`}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-700/20 rounded-full text-xs cursor-pointer hover:bg-gray-700/30"
                          onClick={() => {
                            // Toggle reaction via API
                            const hasReacted = data.users.includes(currentUserId);
                            if (hasReacted) {
                              // Remove reaction
                              axios.delete(`/api/chat/${msg.replyTo ? msg.replyTo.messageId : 'general'}/messages/${msg.id}/reactions`, {
                                data: { emoji },
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem('token')}`
                                }
                              }).catch(console.error);
                            } else {
                              // Add reaction
                              axios.post(`/api/chat/${msg.replyTo ? msg.replyTo.messageId : 'general'}/messages/${msg.id}/reactions`, {
                                emoji
                              }, {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem('token')}`
                                }
                              }).catch(console.error);
                            }
                          }}
                        >
                          <span>{emoji}</span>
                          <span className="text-xs">{data.count}</span>
                          {data.users.includes(currentUserId) && (
                            <span className="text-xs">(you)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reply button */}
              {!msg.replyTo && (
                <div className="absolute bottom-0 right-0 -mb-2 mr-2">
                  <button
                    onClick={() => handleStartReply(msg)}
                    className="p-1 hover:bg-gray-700/20 rounded hover:text-white text-xs text-gray-400"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 6a2.25 2.25 0 010 4.5h1.5a2.25 2.25 0 01 0 010 4.5H12a5.25 5.25 0 00-9.364 3.762.75.75 0 01-1.218-.18A4.5 4.5 0 013 15.75V6a4.5 4.5 0 019 0z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900">
        <ChatMessageComposer
          onMessageSend={handleSend}
          currentReplyingTo={replyTo}
          onCancelReply={handleCancelReply}
        />

        {/* Emoji picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Attachment picker */}
        {showAttachmentPicker && (
          <AttachmentPicker
            onAttachmentChange={handleAttachmentChange}
            onClose={() => setShowAttachmentPicker(false)}
          />
        )}
      </div>
    </div>
  );
}