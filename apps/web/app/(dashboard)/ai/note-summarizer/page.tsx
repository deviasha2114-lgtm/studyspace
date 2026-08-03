import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function NotesSummarizerPage() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');

  const summarizeNotes = async () => {
    if (!content.trim() || !user) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await axios.post(
        `/api/ai/notes-summarizer`,
        {
          content,
          length: summaryLength,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSummary(response.data.summary);
    } catch (err: any) {
      console.error('Error summarizing notes:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to summarize notes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>Please log in to access the AI Notes Summarizer.</p>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">📄</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Notes Summarizer</h2>
                <p className="text-sm text-gray-500">
                  Get concise summaries of long texts instantly
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Convert lengthy study materials, articles, or notes into clear, concise summaries
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}

        {/* Notes Summarizer Form */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            {/* Notes Input */}
            <div>
              <label htmlFor="notes-content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Notes or Text
              </label>
              <p className="text-sm text-gray-500 mb-1">
                Paste the text you want to summarize (lecture notes, article, chapter, etc.)
              </p>
              <textarea
                id="notes-content"
                rows="12"
                placeholder="Paste your notes here... The AI will create a concise summary capturing the key points"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Summary Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="length-short"
                    value="short"
                    checked={summaryLength === 'short'}
                    onChange={(e) => setSummaryLength(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="length-short" className="ml-2 text-sm font-medium text-gray-700">
                    Short (~25%)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="length-medium"
                    value="medium"
                    checked={summaryLength === 'medium'}
                    onChange={(e) => setSummaryLength(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="length-medium" className="ml-2 text-sm font-medium text-gray-700">
                    Medium (~50%)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="length-long"
                    value="long"
                    checked={summaryLength === 'long'}
                    onChange={(e) => setSummaryLength(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="length-long" className="ml-2 text-sm font-medium text-gray-700">
                    Long (~75%)
                  </label>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Percentage of original length
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={summarizeNotes}
                disabled={loading || !content.trim()}
                className={`flex-1 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`}
              >
                {loading ? 'Summarizing...' : 'Summarize Notes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setSummary(null);
                }}
                className="ml-3 bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Summary Display */}
        {summary && (
          <div className="bg-green-50 rounded-lg border-l-4 border-green-500 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                  <span className="text-xl">✅</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Summary:</h3>
                <p className="text-sm text-gray-500">
                  {summaryLength === 'short' ? 'Concise' : summaryLength === 'medium' ? 'Balanced' : 'Detailed'} summary
                </p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              {summary.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>
                Original length: {content.length} characters → Summary length: {summary.length} characters
              </span>
              <span>
                {Math.round((1 - summary.length / content.length) * 100)}% reduction
              </span>
            </div>
          </div>
        )}

        {/* Tips */}
        {!summary && !loading && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                  <span className="text-xl">💡</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tips for better summaries:</h3>
                <p className="text-sm text-gray-500">
                  Get the most accurate summaries by providing clear, well-structured text
                </p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Provide complete paragraphs or sections rather than fragmented text</li>
              <li>Works best with educational content, articles, and structured notes</li>
              <li>For very long texts, consider breaking into sections for better results</li>
              <li>Review the summary to ensure key points are preserved</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}