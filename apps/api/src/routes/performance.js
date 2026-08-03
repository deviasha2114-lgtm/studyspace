const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');

// Save a quiz attempt
router.post('/quiz-attempt', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, score, totalQuestions, timeTaken } = req.body;

    if (!topic || typeof score !== 'number' || score < 0 || score > 100 || !totalQuestions || totalQuestions <= 0) {
      return res.status(400).json({ error: 'Valid topic, score (0-100), and totalQuestions (>0) are required' });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        topic: topic.trim(),
        score: Math.round(score),
        totalQuestions,
        timeTaken: timeTaken || 0
      }
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get flashcard study stats
    const [studySessions, quizAttempts, flashcardSets, flashcardsCount] = await Promise.all([
      prisma.flashcardStudySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 10
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { attemptedAt: 'desc' },
        take: 10
      }),
      prisma.flashcardSet.count({
        where: { userId }
      }),
      prisma.flashcard.count({
        where: {
          flashcardSet: {
            userId
          }
        }
      })
    ]);

    // Calculate averages
    const avgStudyScore = studySessions.length > 0
      ? (studySessions.reduce((sum, session) => {
          const total = session.correctCount + session.incorrectCount;
          return total > 0 ? sum + (session.correctCount / total * 100) : sum;
        }, 0) / studySessions.length)
      : 0;

    const avgQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
      : 0;

    res.json({
      success: true,
      data: {
        flashcardSets: flashcardSets,
        totalFlashcards: flashcardsCount,
        recentStudySessions: studySessions.map(session => ({
          id: session.id,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          correctCount: session.correctCount,
          incorrectCount: session.incorrectCount,
          timeSpent: session.timeSpent,
          accuracy: session.correctCount + session.incorrectCount > 0
            ? (session.correctCount / (session.correctCount + session.incorrectCount)) * 100
            : 0
        })),
        recentQuizAttempts: quizAttempts.map(attempt => ({
          id: attempt.id,
          topic: attempt.topic,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          timeTaken: attempt.timeTaken,
          attemptedAt: attempt.attemptedAt
        })),
        averageStudyScore: Number(avgStudyScore.toFixed(2)),
        averageQuizScore: Number(avgQuizScore.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get performance over time (for charts)
router.get('/performance-over-time', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30; // default to last 30 days
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get quiz attempts over time
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        attemptedAt: { gte: startDate }
      },
      orderBy: { attemptedAt: 'asc' },
      select: {
        attemptedAt: true,
        score: true,
        topic: true
      }
    });

    // Get study sessions over time
    const studySessions = await prisma.flashcardStudySession.findMany({
      where: {
        userId,
        startedAt: { gte: startDate }
      },
      orderBy: { startedAt: 'asc' },
      select: {
        startedAt: true,
        correctCount: true,
        incorrectCount: true
      }
    });

    // Process quiz attempts for chart data
    const quizData = quizAttempts.map(attempt => ({
      date: attempt.attemptedAt.toISOString().split('T')[0],
      score: attempt.score,
      topic: attempt.topic
    }));

    // Process study sessions for chart data (calculate accuracy per session)
    const studyData = studySessions.map(session => {
      const total = session.correctCount + session.incorrectCount;
      const accuracy = total > 0 ? (session.correctCount / total * 100) : 0;
      return {
        date: session.startedAt.toISOString().split('T')[0],
        accuracy: Number(accuracy.toFixed(2)),
        timeSpent: session.timeSpent
      };
    });

    res.json({
      success: true,
      data: {
        quizPerformance: quizData,
        studyPerformance: studyData
      }
    });
  } catch (error) {
    console.error('Error fetching performance over time:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get topic-wise performance
router.get('/topic-performance', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get average score per topic from quiz attempts
    const topicStats = await prisma.quizAttempt.groupBy({
      by: ['topic'],
      where: { userId },
      _avg: { score: true },
      _count: true,
      orderBy: { _avg: { score: 'desc' } }
    });

    const formatted = topicStats.map(stat => ({
      topic: stat.topic,
      averageScore: Number(stat._avg.score?.toFixed(2) || 0),
      attemptCount: stat._count
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching topic performance:', error);
    res.status(500).json({ error: 'Failed to fetch topic performance' });
  }
});

module.exports = router;