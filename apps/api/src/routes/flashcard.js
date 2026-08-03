const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middleware/auth');

// Get all flashcard sets for the user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const sets = await prisma.flashcardSet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { flashcards: true }
        }
      }
    });
    res.json({ success: true, data: sets });
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard sets' });
  }
});

// Create a new flashcard set
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const set = await prisma.flashcardSet.create({
      data: {
        title: title.trim(),
          description: description ? description.trim() : null,
        userId
      }
    });

    res.status(201).json({ success: true, data: set });
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    res.status(500).json({ error: 'Failed to create flashcard set' });
  }
});

// Get a specific flashcard set with its cards
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.id;

    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId },
      include: {
        flashcards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({ success: true, data: set });
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard set' });
  }
});

// Update a flashcard set
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.id;
    const { title, description } = req.body;

    const existingSet = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!existingSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (existingSet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updatedSet = await prisma.flashcardSet.update({
      where: { id: setId },
      data: {
        title: title ? title.trim() : existingSet.title,
        description: description !== undefined ? (description ? description.trim() : null) : existingSet.description,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: updatedSet });
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    res.status(500).json({ error: 'Failed to update flashcard set' });
  }
});

// Delete a flashcard set
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.id;

    const existingSet = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!existingSet) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (existingSet.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Delete associated flashcards first (due to foreign key constraint)
    await prisma.flashcard.deleteMany({
      where: { flashcardSetId: setId }
    });

    await prisma.flashcardSet.delete({
      where: { id: setId }
    });

    res.json({ success: true, message: 'Flashcard set deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    res.status(500).json({ error: 'Failed to delete flashcard set' });
  }
});

// Add a flashcard to a set
router.post('/:setId/cards', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.setId;
    const { question, answer } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Verify the set belongs to the user
    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const card = await prisma.flashcard.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        flashcardSetId: setId
      }
    });

    res.status(201).json({ success: true, data: card });
  } catch (error) {
    console.error('Error adding flashcard:', error);
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
});

// Update a flashcard
router.put('/:setId/cards/:cardId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.setId;
    const cardId = req.params.cardId;
    const { question, answer } = req.body;

    // Verify the set belongs to the user
    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const existingCard = await prisma.flashcard.findUnique({
      where: { id: cardId, flashcardSetId: setId }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const updatedCard = await prisma.flashcard.update({
      where: { id: cardId },
      data: {
        question: question ? question.trim() : existingCard.question,
        answer: answer !== undefined ? (answer ? answer.trim() : null) : existingCard.answer,
      }
    });

    res.json({ success: true, data: updatedCard });
  } catch (error) {
    console.error('Error updating flashcard:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete a flashcard
router.delete('/:setId/cards/:cardId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.setId;
    const cardId = req.params.cardId;

    // Verify the set belongs to the user
    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const existingCard = await prisma.flashcard.findUnique({
      where: { id: cardId, flashcardSetId: setId }
    });

    if (!existingCard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    await prisma.flashcard.delete({
      where: { id: cardId }
    });

    res.json({ success: true, message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// Record a study session
router.post('/:setId/study', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const setId = req.params.setId;
    const { correctCount, incorrectCount, timeSpent } = req.body;

    // Verify the set belongs to the user
    const set = await prisma.flashcardSet.findUnique({
      where: { id: setId }
    });

    if (!set) {
      return res.status(404).json({ error: 'Flashcard set not found' });
    }

    if (set.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const studySession = await prisma.flashcardStudySession.create({
      data: {
        userId,
        flashcardSetId: setId,
        correctCount: correctCount || 0,
        incorrectCount: incorrectCount || 0,
        timeSpent: timeSpent || 0,
        endedAt: new Date()
      }
    });

    res.status(201).json({ success: true, data: studySession });
  } catch (error) {
    console.error('Error recording study session:', error);
    res.status(500).json({ error: 'Failed to record study session' });
  }
});

module.exports = router;