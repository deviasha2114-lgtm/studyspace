'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';

export default function PerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [performanceOverTime, setPerformanceOverTime] = useState<any>(null);
  const [topicPerformance, setTopicPerformance] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, performanceRes, topicRes] = await Promise.all([
        axios.get('/api/performance/stats'),
        axios.get('/api/performance/performance-over-time'),
        axios.get('/api/performance/topic-performance')
      ]);
      setStats(statsRes.data.data);
      setPerformanceOverTime(performanceRes.data.data);
      setTopicPerformance(topicRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500">
        <p className="text-red-700">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Performance Dashboard</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Flashcard Sets</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.flashcardSets || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Flashcards</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalFlashcards || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Study Score</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.averageStudyScore !== null ? `${stats?.averageStudyScore}%` : '0%'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Quiz Score</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.averageQuizScore !== null ? `${stats?.averageQuizScore}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Study Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Study Performance (Last 30 Days)</h2>
        {performanceOverTime && performanceOverTime.studyPerformance && performanceOverTime> 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Accuracy Trend</h3>
            <div className="h-64 w-full overflow-hidden rounded bg-gray-200">
              {/* In a real app, we would use a charting library like Chart.js or Recharts */}
              <div className="relative h-full w-full">
                {performanceOverTime.studyPerformance.map((point: any, index: number) => (
                  <div
                    key={index}
                    className={`absolute left-[${((index / (performanceOverTime.studyPerformance.length - 1) || 0) * 100)}%] bottom-0 h-[${point.accuracy}%] w-[${100 / Math.max(1, performanceOverTime.studyPerformance.length)}%] bg-blue-500`}
                  >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-white rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Each bar represents a study session's accuracy percentage
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No study sessions recorded yet.</p>
        )}
      </div>

      {/* Quiz Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Quiz Performance (Last 30 Days)</h2>
        {performanceOverTime && performanceOverTime.quizPerformance.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Score Trend</h3>
            <div className="h-64 w-full overflow-hidden rounded bg-gray-200">
              <div className="relative h-full w-full">
                {performanceOverTime.quizPerformance.map((point: any, index: number) => (
                  <div
                    key={index}
                    className={`absolute left-[${((index / (performanceOverTime.quizPerformance.length - 1) || 0) * 100)}%] bottom-0 h-[${point.score}%] w-[${100 / Math.max(1, performanceOverTime.quizPerformance.length)}%] bg-green-500`}
                  >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-white rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Each bar represents a quiz attempt's score percentage
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No quiz attempts recorded yet.</p>
        )}
      </div>

      {/* Topic Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Performance by Topic</h2>
        {topicPerformance && topicPerformance.length > 0 ? (
          <div className="space-y-4">
            {topicPerformance.map((topic: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{topic.topic}</h3>
                    <p className="text-sm text-gray-500">
                      {topic.attemptCount} quiz attempt{topic.attemptCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {topic.averageScore}%
                    </p>
                    <p className="text-xs text-gray-500">average score</p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${topic.averageScore >= 80 ? 'green-500' : topic.averageScore >= 60 ? 'yellow-500' : 'red-500'} w-[${topic.averageShare}%]`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No topic-specific data available yet.</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats?.recentStudySessions && stats.recentStudySessions.length > 0 ? (
            <>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Study Sessions</h3>
              <div className="space-y-2">
                {stats.recentStudySessions.map((session: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Study Session</p>
                        <p className="text-sm text-gray-500">
                          {session.correctCount} correct, {session.incorrectCount} incorrect
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full bg-blue-500 w-[${session.accuracy}%]`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No recent study sessions.</p>
          )}

          {stats?.recentQuizAttempts && stats.recentQuizAttempts.length > 0 ? (
            <>
              <h3 className="text-sm font-medium text-gray-600 mt-4 mb-2">Quiz Attempts</h3>
              <div className="space-y-2">
                {stats.recentQuizAttempts.map((attempt: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Quiz: {attempt.topic}</p>
                        <p className="text-sm text-gray-500">
                          {attempt.score}% ({attempt.score * attempt.totalQuestions / 100}/${attempt.totalQuestions})
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 mt-4">No recent quiz attempts.</p>
          )}
        </div>
      </div>
    </div>
  );
}