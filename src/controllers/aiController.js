const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractPdfText(filePath) {
  try {
    const buffer = fs.readFileSync(path.resolve(filePath));
    const data = await pdfParse(buffer);
    return data.text?.trim() || '';
  } catch (err) {
    console.error('[AI] PDF extract error:', err);
    return '';
  }
}

async function callClaude(extractedText, userMessage, sessionHistory = []) {
  const systemPrompt = `Tu ek helpful study assistant hai. User ne yeh PDF upload ki hai. Sirf PDF ke content ke basis pe questions answer kar. Agar answer PDF mein nahi hai toh clearly bol do.\n\nContext:\n${extractedText || 'PDF content available nahi hai.'}`;
  const messages = [...sessionHistory.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }];
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: systemPrompt, messages }),
  });
  if (!response.ok) { const err = await response.json(); throw new Error(err?.error?.message || 'Claude API call failed'); }
  const data = await response.json();
  return data.content?.[0]?.text || 'Sorry, koi response nahi mila.';
}

const chat = async (req, res) => {
  try {
    const { noteId, message, sessionId } = req.body;
    const userId = req.user.id;
    if (!noteId || !message?.trim()) return res.status(400).json({ success: false, message: 'noteId aur message required hain.' });
    const note = await prisma.note.findUnique({ where: { id: noteId }, select: { id: true, title: true, fileUrl: true, status: true } });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    if (note.status !== 'APPROVED') return res.status(403).json({ success: false, message: 'Sirf approved notes pe chat kar sakte ho.' });
    const extractedText = await extractPdfText(note.fileUrl);
    let session;
    if (sessionId) { session = await prisma.aISession.findFirst({ where: { id: sessionId, userId, noteId }, include: { messages: { orderBy: { createdAt: 'asc' } } } }); }
    if (!session) { session = await prisma.aISession.create({ data: { noteId, userId }, include: { messages: true } }); }
    const sessionHistory = session.messages.map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await callClaude(extractedText, message.trim(), sessionHistory);
    await prisma.aIMessage.createMany({ data: [{ sessionId: session.id, role: 'user', content: message.trim() }, { sessionId: session.id, role: 'assistant', content: aiResponse }] });
    return res.status(200).json({ success: true, data: { sessionId: session.id, noteId, message: aiResponse } });
  } catch (error) { console.error('[AI Chat] Error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};

const getSessions = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    const sessions = await prisma.aISession.findMany({ where: { noteId, userId }, orderBy: { createdAt: 'desc' }, include: { messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true, createdAt: true } } } });
    return res.status(200).json({ success: true, data: { noteId, totalSessions: sessions.length, sessions: sessions.map(s => ({ sessionId: s.id, createdAt: s.createdAt, updatedAt: s.updatedAt, messageCount: s.messages.length, messages: s.messages })) } });
  } catch (error) { console.error('[AI Sessions] Error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};

module.exports = { chat, getSessions };
