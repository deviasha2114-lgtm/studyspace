import { useState } from 'react';

interface Attachment {
  url: string;
  type: 'image' | 'file' | 'audio' | 'video';
  name: string;
  size: number;
}

interface AttachmentPickerProps {
  onAttachmentChange: (attachments: Attachment[]) => void;
  onClose: () => void;
}

export const AttachmentPicker = ({ onAttachmentChange, onClose }: AttachmentPickerProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const attachments: Attachment[] = files.map(file => {
      // Determine file type
      const type = file.type.startsWith('image/') ? 'image' :
                  file.type.startsWith('audio/') ? 'audio' :
                  file.type.startsWith('video/') ? 'video' : 'file';

      // Create preview URL for images
      if (type === 'image') {
        setPreviewUrl(URL.createObjectURL(file));
      }

      return {
        url: URL.createObjectURL(file),
        type,
        name: file.name,
        size: file.size
      };
    });

    onAttachment(attachments);
    e.target.value = ''; // Reset input
  };

  const handleRemoveAttachment = (index: number) => {
    // In a real implementation, you would revoke the object URLs
    // For simplicity, we're just updating the state
    // This would need to be handled properly in a real app
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-96 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Attach Files</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview for images */}
        {previewUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                setPreviewUrl(null);
                // In a real app, you'd remove the image from attachments
              }}
              className="absolute top-2 right-2 bg-white bg-opacity-70 hover:bg-white rounded-full p-1"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* File input */}
        <div className="p-4">
          <label
            htmlFor="file-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select files to attach
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.mp3,.mp4,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:hover:bg-indigo-100"
          />

          <p className="mt-2 text-xs text-gray-500">
            Supported formats: Images, PDF, Documents, Audio, Video
          </p>
        </div>
      </div>
    </div>
  );
};