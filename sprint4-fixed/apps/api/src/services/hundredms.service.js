const jwt = require('jsonwebtoken');

const HMS_APP_SECRET = process.env.HMS_APP_SECRET;
const HMS_APP_ACCESS_KEY = process.env.HMS_APP_ACCESS_KEY;

/**
 * create100msToken — generates a 100ms management token
 * Docs: https://www.100ms.live/docs/server-side/v2/how-to-guides/make-api-calls
 */
const create100msToken = async ({ roomId, userId, role, userName }) => {
  const payload = {
    access_key: HMS_APP_ACCESS_KEY,
    room_id: roomId,
    user_id: userId,
    role,
    type: 'app',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, HMS_APP_SECRET, {
    algorithm: 'HS256',
    expiresIn: '24h',
    jwtid: `${userId}-${Date.now()}`,
  });

  return token;
};

module.exports = { create100msToken };
