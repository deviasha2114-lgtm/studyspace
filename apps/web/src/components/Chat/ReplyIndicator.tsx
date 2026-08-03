import { useState } from 'react';

interface ReplyIndicatorProps {
  messageId: string;
  content: string;
  senderName: string;
  onCancel: () => void;
}

export const ReplyIndicator = ({
  messageId,
  content,
  senderName,
  onCancel
}: ReplyIndicatorProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex items-start space-x-3 p-3 ${hovered ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            {senderName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900">{senderName}</h4>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-300 rounded hover:text-gray-800"
            aria-label="Cancel reply"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
          {content}
        </p>
      </div>
    </div>
  );
};