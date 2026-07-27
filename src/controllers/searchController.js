const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const VALID_TYPES = ['notes', 'users', 'communities', 'all'];
const PAGE_SIZE = 10;

const search = async (req, res) => {
  try {
    const { q = '', type = 'all', page = '1' } = req.query;
    const userId = req.user?.id;
    const query = q.trim();
    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const skip = (pageNum - 1) * PAGE_SIZE;
    const [notes, users, communities] = await Promise.all([
      shouldSearch('notes', type) ? searchNotes(query, skip, PAGE_SIZE) : Promise.resolve({ results: [], total: 0 }),
      shouldSearch('users', type) ? searchUsers(query, skip, PAGE_SIZE) : Promise.resolve({ results: [], total: 0 }),
      shouldSearch('communities', type) ? searchCommunities(query, skip, PAGE_SIZE) : Promise.resolve({ results: [], total: 0 }),
    ]);
    saveSearchLog({ userId, query, type, resultsCount: notes.total + users.total + communities.total }).catch(err => console.error('[SearchLog] Failed to save:', err));
    return res.status(200).json({
      success: true,
      data: { query, type, page: pageNum, pageSize: PAGE_SIZE,
        ...(shouldSearch('notes', type) && { notes }),
        ...(shouldSearch('users', type) && { users }),
        ...(shouldSearch('communities', type) && { communities }),
      },
    });
  } catch (error) {
    console.error('[Search] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

function shouldSearch(entity, type) { return type === 'all' || type === entity; }

async function searchNotes(query, skip, take) {
  const pattern = `%${query}%`;
  const [results, countResult] = await Promise.all([
    prisma.$queryRaw`SELECT n.id, n.title, n.slug, n.thumbnail, n.created_at AS "createdAt", u.name AS "uploaderName", u.avatar AS "uploaderAvatar", c.name AS "communityName", c.slug AS "communitySlug" FROM notes n LEFT JOIN users u ON u.id = n.user_id LEFT JOIN communities c ON c.id = n.community_id WHERE n.status = 'APPROVED' AND n.title ILIKE ${pattern} ORDER BY n.created_at DESC LIMIT ${take} OFFSET ${skip}`,
    prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM notes WHERE status = 'APPROVED' AND title ILIKE ${pattern}`,
  ]);
  return { results, total: countResult[0]?.total ?? 0 };
}

async function searchUsers(query, skip, take) {
  const pattern = `%${query}%`;
  const [results, countResult] = await Promise.all([
    prisma.$queryRaw`SELECT id, name, username, avatar, bio, created_at AS "createdAt" FROM users WHERE name ILIKE ${pattern} OR username ILIKE ${pattern} ORDER BY name ASC LIMIT ${take} OFFSET ${skip}`,
    prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM users WHERE name ILIKE ${pattern} OR username ILIKE ${pattern}`,
  ]);
  return { results, total: countResult[0]?.total ?? 0 };
}

async function searchCommunities(query, skip, take) {
  const pattern = `%${query}%`;
  const [results, countResult] = await Promise.all([
    prisma.$queryRaw`SELECT id, name, slug, description, avatar, created_at AS "createdAt" FROM communities WHERE name ILIKE ${pattern} OR slug ILIKE ${pattern} ORDER BY name ASC LIMIT ${take} OFFSET ${skip}`,
    prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM communities WHERE name ILIKE ${pattern} OR slug ILIKE ${pattern}`,
  ]);
  return { results, total: countResult[0]?.total ?? 0 };
}

async function saveSearchLog({ userId, query, type, resultsCount }) {
  await prisma.searchLog.create({ data: { query, type, resultsCount, ...(userId && { userId }) } });
}

module.exports = { search };
