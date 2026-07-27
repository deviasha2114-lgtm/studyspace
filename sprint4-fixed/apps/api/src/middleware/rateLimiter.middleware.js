const { getRedis } = require('../config/redis');

const WINDOW_SECONDS = 60;
const MAX_MESSAGES   = 30;

/**
 * Redis sliding-window rate limiter for chat messages.
 * Key: chat_rl:{userId}:{communityId}
 * Allows 30 messages per 60-second window per user.
 */
const chatRateLimiter = async (req, res, next) => {
  const redis = getRedis();
  const userId = req.user._id || req.user.id;
  const { communityId } = req.params;

  const key = `chat_rl:${userId}:${communityId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SECONDS * 1000;

  try {
    // Remove entries outside the window, then count + add current timestamp
    const pipeline = redis.multi();
    pipeline.zRemRangeByScore(key, '-inf', windowStart);
    pipeline.zCard(key);
    pipeline.zAdd(key, [{ score: now, value: `${now}` }]);
    pipeline.expire(key, WINDOW_SECONDS);

    const results = await pipeline.exec();
    const messageCount = results[1]; // count BEFORE adding current message

    if (messageCount >= MAX_MESSAGES) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_MESSAGES} messages per minute allowed`,
        retryAfter: WINDOW_SECONDS,
      });
    }

    // Pass remaining quota in response header
    res.setHeader('X-RateLimit-Limit', MAX_MESSAGES);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_MESSAGES - messageCount - 1));
    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    next(); // Fail open — don't block users on Redis errors
  }
};

/**
 * Socket.IO rate limiter — same logic, returns boolean.
 * Call before emitting message in socket handler.
 */
const socketChatRateLimiter = async (userId, communityId) => {
  const redis = getRedis();
  const key = `chat_rl:${userId}:${communityId}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SECONDS * 1000;

  try {
    const pipeline = redis.multi();
    pipeline.zRemRangeByScore(key, '-inf', windowStart);
    pipeline.zCard(key);
    pipeline.zAdd(key, [{ score: now, value: `${now}` }]);
    pipeline.expire(key, WINDOW_SECONDS);

    const results = await pipeline.exec();
    const count = results[1];

    return { allowed: count < MAX_MESSAGES, remaining: Math.max(0, MAX_MESSAGES - count - 1) };
  } catch {
    return { allowed: true, remaining: MAX_MESSAGES }; // Fail open
  }
};

module.exports = { chatRateLimiter, socketChatRateLimiter };
