// apps/api/src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rateLimiter } = require('../middleware/rateLimiter.middleware');
const Anthropic = require('@anthropic-ai/sdk');
const pdfParse = require('pdf-parse');
const fetch = require('node-fetch');

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Rate limit: 20 requests/minute per user
const aiRateLimit = rateLimiter({ max: 20, windowMs: 60 * 1000 });

// Sanitize text to prevent prompt injection
const sanitizeText = (text) => {
  return text
    .replace(/system:/gi, '')
    .replace(/assistant:/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .trim();
};

// Extract text from PDF URL
const extractPdfText = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    const data = await pdfParse(buffer);
    return data.text.slice(0, 8000); // limit context size
  } catch (err) {
    return null;
  }
};

// POST /api/ai/chat
router.post('/chat', authMiddleware, aiRateLimit, async (req, res) => {
  try {
    const { noteId, message, sessionId } = req.body;
    const userId = req.user.id;

    if (!noteId || !message) {
      return res.status(400).json({ error: 'noteId and message are required' });
    }

    // Get note with file
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, title: true, content: true, fileUrl: true },
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Extract PDF text if available
    let pdfText = '';
    if (note.fileUrl) {
      pdfText = await extractPdfText(note.fileUrl) || '';
    }

    const context = pdfText || note.content || '';
    const sanitizedMessage = sanitizeText(message);

    // Get or create session
    let session = null;
    let history = [];

    if (sessionId) {
      session = await prisma.aISession.findFirst({
        where: { id: sessionId, userId }, // user can only access own sessions
      });
      if (session) history = session.messages || [];
    }

    // Build messages for Claude
    const messages = [
      ...history,
      { role: 'user', content: sanitizedMessage },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `Tu ek helpful study assistant hai. User ne yeh note/PDF upload ki hai titled "${note.title}". Sirf is content ke basis pe questions answer kar. Agar answer content mein nahi hai toh clearly bol do "Is PDF/note mein yeh information nahi hai."

Content:
${context}`,
      messages,
    });

    const aiReply = response.content[0].text;

    // Update history
    const updatedHistory = [
      ...history,
      { role: 'user', content: sanitizedMessage },
      { role: 'assistant', content: aiReply },
    ];

    // Save/update session
    if (session) {
      session = await prisma.aISession.update({
        where: { id: session.id },
        data: { messages: updatedHistory },
      });
    } else {
      session = await prisma.aISession.create({
        data: {
          userId,
          noteId,
          messages: updatedHistory,
        },
      });
    }

    res.json({
      reply: aiReply,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// GET /api/ai/sessions/:noteId
router.get('/sessions/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const sessions = await prisma.aISession.findMany({
      where: { noteId, userId }, // only own sessions
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: true,
      },
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
