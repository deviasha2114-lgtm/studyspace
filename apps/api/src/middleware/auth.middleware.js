const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * authenticate — Express middleware
 * Verifies Bearer token in Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

/**
 * 🔒 FIX 1: authenticateSocket — Socket.IO io.use() middleware
 * Har naye socket connection pe JWT verify karta hai.
 * Token client se socket.handshake.auth.token mein aana chahiyo.
 *
 * Client-side usage:
 *   const socket = io(URL, { auth: { token: localStorage.getItem('jwt') } });
 */
const authenticateSocket = (socket, next) => {
  try {
    // Token can come from auth object or Authorization header
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Unauthorized: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // attach user to socket for downstream handlers
    next();
  } catch (err) {
    // Connection rejected — client will receive 'connect_error'
    return next(new Error('Unauthorized: Invalid or expired token'));
  }
};

// Alias for backward compatibility
const protect = authenticate;

module.exports = { authenticate, authenticateSocket, protect };
