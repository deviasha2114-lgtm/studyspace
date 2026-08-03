import { useState } from 'react';

interface AttachmentPreviewProps {
  attachment: {
    url: string;
    type: 'image' | 'file' | 'audio' | 'video';
    name: string;
    size: number;
  };
  onRemove: () => void;
}

export const AttachmentPreview = ({ attachment, onRemove }: AttachmentPreviewProps) => {
  const [hovered, setHovered] = useState(false);

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'audio': return '🎵';
      case 'video': return '🎥';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex items-start space-x-3 p-3 ${hovered ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
    >
      {/* File icon */}
      <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
        {attachment.type === 'image' && (
          <img
            src={attachment.url}
            alt="Preview"
            className="h-8 w-8 object-contain"
            onError={
              (e: React.ReactEvent) => {
                // Fallback to icon if image fails to load
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMThoNHY2aC0yek0xOSA3aC0yaDR2MnptLTQgN2gtMnYyAttempt to display image failed, showing icon instead.' />
              }}
            />
        )}
        {attachment.type !== 'image' && (
          <span className="text-gray-600">{getFileTypeIcon(attachment.type)}</span>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 truncate max-w-xs">
            {attachment.name}
          </h4>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-gray-300 rounded hover:text-gray-800"
            aria-label="Remove attachment"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {attachment.type === 'image' && (
          <img
            src={attachment.url}
            alt="Preview"
            className="max-w-xs max-h-48 rounded border border-gray-200 object-contain"
          />
        )}

        {attachment.type === 'audio' && (
          <div className="mt-2">
            <audio controls className="w-full">
              <source src={attachment.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {attachment.type === 'video' && (
          <div className="mt-2">
            <video controls className="w-full max-h-48 object-contain">
              <source src={attachment.url} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {(attachment.type === 'file' || attachment.type === 'pdf') && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="flex-shrink-0">
              📄
            </span>
            <span>
              {formatFileSize(attachment.size)} • {attachment.type.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};