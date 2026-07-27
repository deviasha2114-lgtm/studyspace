const { getDB } = require('../config/db');
const { create100msToken } = require('../services/hundredms.service');

/**
 * POST /api/video/:communityId/token
 * Issues a 100ms room token ONLY after verifying community membership.
 *
 * 🔒 FIX: db.communityMembers.exists() check added before token issue
 */
const getVideoToken = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { communityId } = req.params;
    const { role = 'viewer' } = req.body; // 'host' | 'viewer'

    // ── Membership Check ──────────────────────────────────────────
    const db = getDB();
    const isMember = await db.collection('communityMembers').findOne({
      communityId,
      userId: userId.toString(),
      status: 'active',
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be a community member to join this video room',
      });
    }

    // ── Issue 100ms Token ─────────────────────────────────────────
    // Only after membership is confirmed
    const token = await create100msToken({
      roomId: communityId,        // 100ms room ID = communityId
      userId: userId.toString(),
      role,
      userName: req.user.name,
    });

    return res.json({
      success: true,
      token,
      roomId: communityId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getVideoToken };
