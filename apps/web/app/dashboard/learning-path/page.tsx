import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function LearningPathPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningPath, setLearningPath] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/learning-path', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setLearningPath(response.data.data);
      } catch (err: any) {
        console.error('Error fetching learning path:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load learning path'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPath();
  }, [user]);

  const markComplete = async (weekId: number, activityId: string) => {
    if (!user) return;

    try {
      await axios.post(
        `/api/learning-path/progress`,
        {
          weekId,
          activityId,
          completed: true
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update local state
      setLearningPath(prev => {
        if (!prev) return prev;

        const updatedWeeks = prev.weeks.map(week => {
          if (week.id === weekId) {
            const updatedActivities = week.activities.map(activity =>
              activity.id === activityId
                ? { ...activity, completed: true, completedAt: new Date().toISOString() }
                : activity
            );

            // Check if all activities in week are completed
            const allCompleted = updatedActivities.every(activity => activity.completed);

            return {
              ...week,
              activities: updatedActivities,
              completed: allCompleted,
              completedAt: allCompleted ? new Date().toISOString() : week.completedAt
            };
          }
          return week;
        });

        // Update overall progress
        const completedWeeks = updatedWeeks.filter(week => week.completed).length;
        const totalWeeks = updatedWeeks.length;
        const progressPercentage = Math.floor((completedWeeks / totalWeeks) * 100);

        return {
          ...prev,
          weeks: updatedWeeks,
          progress: {
            ...prev.progress,
            completedWeeks,
            totalWeeks,
            percentage: progressPercentage
          }
        };
      });
    } catch (err: any) {
      console.error('Error marking activity complete:', err);
      alert(
        err.response?.data?.message ||
          'Failed to update progress. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Learning Path</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Your Learning Journey</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </div>
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Path</h2>
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

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No learning path available</h3>
            <p className="text-sm text-gray-500 mt-2">
              Complete your profile or take an assessment to get a personalized learning plan.
            </p>
            <Link
              href="/dashboard/profile/edit"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { title, description, subject, level, progress, weeks } = learningPath;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">📚</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{subject} • Level {level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  Progress: {progress.percentage}%
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {progress.percentage}%
                </div>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600">{description}</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full"
                 style={{ width: `${progress.percentage}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>{progress.completedWeeks}/{progress.totalWeeks} weeks completed</span>
            <span>{progress.pointsEarned} points earned</span>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-6">
          {weeks.map((week: any, index: number) => (
            <div key={week.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Week Header */}
              <div className={`px-6 py-4 border-b bg-${week.completed ? 'green-50' : 'gray-50'} flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 flex items-center justify-center bg-${week.completed ? 'green-100' : 'indigo-100'} text-${week.completed ? 'green-600' : 'indigo-600'} rounded-full">
                      {week.icon || `W${week.weekNumber}`}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Week {week.weekNumber}: {week.title}</h3>
                    <p className="text-sm text-gray-500">{week.description}</p>
                  </div>
                </div>
                <div className="text-sm">
                  {week.completed ? (
                    <span className="text-green-600 font-medium">Completed</span>
                  ) : (
                    <span className="text-gray-400">
                      {week.activities.filter((a: any) => a.completed).length}/{week.activities.length} activities
                    </span>
                  )}
                </div>
              </div>

              {/* Week Content */}
              <div className="p-6 space-y-4">
                {week.activities.map((activity: any, actIndex: number) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {activity.completed ? (
                        <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-dotted border-gray-400 flex items-center justify-center text-gray-400 text-xs">
                          ○
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <span className="text-xs px-2 py-0.5 bg-${activity.completed ? 'green-100' : 'blue-100'} text-${activity.completed ? 'green-800' : 'blue-800'} rounded-full">
                          {activity.type || 'Activity'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>⏱️ {activity.estimatedTime} min</span>
                        <span>📊 {activity.points} pts</span>
                        {!activity.completed && (
                          <button
                            onClick={() => markComplete(week.id, activity.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Rewards */}
        {progress.percentage === 100 && (
          <div className="mt-8 bg-green-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">🎉</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
            <p className="text-lg text-green-600 mb-4">
              You've completed the entire learning path!
            </p>
            <div className="flex justify-center space-x-4">
              <span className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full text-green-800 font-medium">
                <span className="text-2xl">🏆</span>
                <span>Master of {subject}</span>
              </span>
              <span className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-blue-800 font-medium">
                <span className="text-2xl">💎</span>
                <span>{progress.pointsEarned + 500} Total Points</span>
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}


        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}