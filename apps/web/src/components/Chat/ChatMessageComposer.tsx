import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useSocket } from '@/hooks/useSocket';
import AttachmentPicker from './AttachmentPicker';
import EmojiPicker from './EmojiPicker';

interface ChatMessageComposerProps {
  onMessageSend: (content: string, attachments: any[], replyTo?: string) => void;
  currentReplyingTo?: {
    messageId: string;
    content: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
}

export const ChatMessageComposer = ({
  onMessageSend,
  currentReplyingTo,
  onCancelReply
}: ChatMessageComposerProps) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    try {
      await onMessageSend(message.trim(), attachments);

      // Reset form
      setMessage('');
      setAttachments([]);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // In a real app, show error notification
    }
  };

  const handleAttachmentChange = (newAttachments: any[]) => {
    setAttachments(newAttachments);
    setShowAttachmentPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus textarea after emoji selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex flex-col">
      {/* Reply indicator */}
      {currentReplyingTo && (
        <div className="flex items-start px-3 py-2 bg-blue-50 rounded-lg mb-2">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-600">
              {currentReplyingTo.senderName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 ml-3 space-y-0.5">
            <p className="text-xs text-gray-500">Replying to</p>
            <p className="font-medium text-gray-900 truncate">
              {currentReplyingTo.senderName}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1 max-w-xs">
              {currentReplyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-2 flex-shrink-0 p-1 hover:bg-blue-100 rounded"
            aria-label="Cancel reply"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Message input and controls */}
      <div className="flex items-center space-x-2">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
        >
          <span className="text-xl">😀</span>
        </button>

        {/* Attachment button */}
        <button
          onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>

        {/* Message input */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-h-[44px] resize-none pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() && attachments.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {/* Attachment picker */}
      {showAttachmentPicker && (
        <AttachmentPicker
          onAttachmentChange={handleAttachmentChange}
          onClose={() => setShowAttachmentPicker(false)}
        />
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};