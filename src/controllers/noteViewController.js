const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const trackView = async (req, res) => {
  try {
    const { id: noteId } = req.params;
    const userId = req.user?.id || null;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    if (userId) {
      await prisma.noteView.upsert({ where: { noteId_userId: { noteId, userId } }, update: { viewedAt: new Date() }, create: { noteId, userId, ip } });
    } else {
      await prisma.noteView.create({ data: { noteId, ip } });
    }
    const viewCount = await prisma.noteView.count({ where: { noteId } });
    return res.status(200).json({ success: true, data: { noteId, viewCount } });
  } catch (error) { console.error('[NoteView] Error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};
module.exports = { trackView };
