import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function QuizGeneratorPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const generateQuiz = async () => {
    if (!topic.trim() || !user) return;

    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const response = await axios.post(
        `/api/ai/quiz-generator`,
        {
          topic,
          difficulty,
          count: questionCount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setQuestions(response.data.questions || []);
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to generate quiz. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = (questionIndex: number, selectedOption: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.userAnswer = selectedOption;
      question.isCorrect = selectedOption === question.correctAnswer;
      setQuestions(updatedQuestions);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>Please log in to access the AI Quiz Generator.</p>
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
                <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">📝</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h2>
                <p className="text-sm text-gray-500">
                  Generate practice quizzes on any topic instantly
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
            Create customized quizzes to test your knowledge and prepare for exams
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}

        {/* Quiz Generator Form */}
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label htmlFor="quiz-topic" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Topic
              </label>
              <input
                id="quiz-topic"
                placeholder="Enter topic (e.g., Photosynthesis, Trigonometry, World War II)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="difficulty-easy"
                      value="easy"
                      checked={difficulty === 'easy'}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="difficulty-easy" className="ml-2 text-sm font-medium text-gray-700">
                      Easy
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="difficulty-medium"
                      value="medium"
                      checked={difficulty === 'medium'}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="difficulty-medium" className="ml-2 text-sm font-medium text-gray-700">
                      Medium
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="difficulty-hard"
                      value="hard"
                      checked={difficulty === 'hard'}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="difficulty-hard" className="ml-2 text-sm font-medium text-gray-700">
                      Hard
                    </label>
                  </div>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-mono">{questionCount}</span>
                  <button
                    onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  1-20 questions
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={generateQuiz}
                disabled={loading || !topic.trim()}
                className={`w-full bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`}
              >
                {loading ? 'Generating Quiz...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        </form>

        {/* Quiz Display */}
        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <span className="text-indigo-600">📊</span>
                Your Generated Quiz
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Topic: {topic} • Difficulty: {difficulty} • {questions.length} questions
              </p>
            </div>
            <div className="p-6 space-y-4">
              {questions.map((question: any, index: number) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-7 w-7 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="mb-2 font-medium text-gray-900">{question.question}</p>
                      {question.options && (
                        <div className="space-y-2">
                          {question.options.map((opt: string, optIndex: number) => (
                            <label key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={opt}
                                checked={question.userAnswer === opt}
                                onChange={(e) => checkAnswer(index, e.target.value)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{opt}</p>
                                {question.userAnswer !== undefined && (
                                  <span className={`ml-2 text-xs ${
                                    question.isCorrect === false && question.userAnswer === opt
                                      ? 'text-red-600'
                                    : question.isCorrect === true && question.userAnswer === opt
                                      ? 'text-green-600'
                                    : 'text-gray-500'
                                  }`}>
                                    {question.userAnswer === opt
                                      ? question.isCorrect
                                        ? '✓ Correct'
                                        : '✗ Incorrect'
                                      : ''}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {question.userAnswer !== undefined && (
                    <div className="mt-3 p-3 rounded-lg">
                      {question.isCorrect ? (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-800">
                          <span className="font-medium">Correct!</span> {question.explanation || ''}
                        </div>
                      ) : (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-800">
                          <span className="font-medium">Incorrect</span>
                          <p className="mt-1">The correct answer is: {question.correctAnswer}</p>
                          {question.explanation && (
                            <p className="mt-1 text-sm">{question.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Score Summary */}
              {questions.some(q => q.userAnswer !== undefined) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Score:</span>
                    <span className="font-bold">
                      {questions.filter(q => q.isCorrect === true).length}/{questions.length}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`bg-${questions.filter(q => q.isCorrect === true).length / questions.length >= 0.8 ? 'green-500' : questions.filter(q => q.isCorrect === true).length / questions.length >= 0.6 ? 'yellow-500' : 'red-500'} h-2.5 rounded-full`}
                      style={{ width: `${(questions.filter(q => q.isCorrect === true).length / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {Math.round((questions.filter(q => q.isCorrect === true).length / questions.length) * 100)}% correct
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        {!questions.length && !loading && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                  <span className="text-xl">💡</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tips for effective practice:</h3>
                <p className="text-sm text-gray-500">
                  Use generated quizzes to test your understanding and identify areas for improvement
                </p>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Start with easier difficulty levels to build confidence</li>
              <li>Review explanations for both correct and incorrect answers</li>
              <li>Repeat quizzes on the same topic to reinforce learning</li>
              <li>Mix different topics for comprehensive preparation</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}