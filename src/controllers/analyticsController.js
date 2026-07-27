const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getCommunityAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) return res.status(404).json({ success: false, message: 'Community not found.' });
    const [memberCount, noteCount, messageCount, topNotes] = await Promise.all([
      prisma.communityMember.count({ where: { communityId: id } }),
      prisma.note.count({ where: { communityId: id, status: 'APPROVED' } }),
      prisma.message.count({ where: { communityId: id } }),
      prisma.note.findMany({ where: { communityId: id, status: 'APPROVED' }, orderBy: { views: { _count: 'desc' } }, take: 5, select: { id: true, title: true, slug: true, thumbnail: true, createdAt: true, _count: { select: { views: true } }, user: { select: { name: true, avatar: true } } } }),
    ]);
    return res.status(200).json({ success: true, data: { community: { id: community.id, name: community.name, slug: community.slug }, memberCount, noteCount, messageCount, topNotes: topNotes.map(n => ({ id: n.id, title: n.title, slug: n.slug, thumbnail: n.thumbnail, viewCount: n._count.views, uploader: n.user, createdAt: n.createdAt })) } });
  } catch (error) { console.error('[Analytics] Community error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};
const getNoteAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({ where: { id }, select: { id: true, title: true, slug: true, status: true, createdAt: true, user: { select: { id: true, name: true, avatar: true } }, _count: { select: { views: true, reports: true } } } });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
    return res.status(200).json({ success: true, data: { id: note.id, title: note.title, slug: note.slug, moderationStatus: note.status, viewCount: note._count.views, reportCount: note._count.reports, uploader: note.user, createdAt: note.createdAt } });
  } catch (error) { console.error('[Analytics] Note error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};
const getUserAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const [notesUploaded, communitiesJoined, followersCount] = await Promise.all([
      prisma.note.count({ where: { userId: id } }),
      prisma.communityMember.count({ where: { userId: id } }),
      prisma.follow.count({ where: { followingId: id } }),
    ]);
    return res.status(200).json({ success: true, data: { user: { id: user.id, name: user.name, username: user.username, avatar: user.avatar }, notesUploaded, communitiesJoined, followersCount } });
  } catch (error) { console.error('[Analytics] User error:', error); return res.status(500).json({ success: false, message: 'Internal server error.' }); }
};
module.exports = { getCommunityAnalytics, getNoteAnalytics, getUserAnalytics };
