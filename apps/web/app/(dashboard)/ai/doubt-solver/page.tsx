import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function DoubtSolverPage() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState('');

  const askDoubt = async () => {
    if (!question.trim() || !user) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await axios.post(
        `/api/ai/doubt-solver`,
        {
          question,
          context: context || 'General academic question',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setAnswer(response.data.answer);
    } catch (err: any) {
      console.error('Error solving doubt:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to solve doubt. Please try again.'
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
            <p>Please log in to access the AI Doubt Solver.</p>
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
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">❓</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Doubt Solver</h2>
                <p className="text-sm text-gray-500">
                  Get instant help with your academic questions
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
            Ask any academic question and get AI-powered explanations and solutions
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}

        {/* Doubt Solver Form */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Question Input */}
            <div>
              <label htmlFor="doubt-question" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                id="doubt-question"
                rows="4"
                placeholder="Ask your question here (e.g., Explain Newton's laws of motion, How to solve quadratic equations, etc.)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Context (Optional) */}
            <div>
              <label htmlFor="doubt-context" className="block text-sm font-medium text-gray-700 mb-2">
                Context (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-1">
                Provide additional context for better answers (subject, chapter, specific problem details)
              </p>
              <textarea
                id="doubt-context"
                rows="3"
                placeholder="E.g., Studying for JEE Physics, Chapter on Mechanics, Newton's Second Law"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={askDoubt}
                disabled={loading || !question.trim()}
                className={`flex-1 bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`}
              >
                {loading ? 'Solving...' : 'Ask Question'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestion('');
                  setContext('');
                  setAnswer(null);
                }}
                className="ml-3 bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Answer Display */}
        {answer && (
          <div className="mt-8 bg-green-50 rounded-lg border-l-4 border-green-500 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                  <span className="text-xl">✅</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Answer:</h3>
                <p className="text-sm text-gray-500">
                  AI-powered explanation
                </p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              {answer.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {!answer && !loading && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                  <span className="text-xl">💡</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tips for better answers:</h3>
                <p className="text-sm text-gray-500">
                  Get more accurate responses by providing context about your topic
                </p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Be specific about what you're asking</li>
              <li>Mention your subject, class, or exam (e.g., JEE, NEET, boards)</li>
              <li>Include any specific formulas or concepts you're struggling with</li>
              <li>Try breaking complex questions into smaller parts</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}