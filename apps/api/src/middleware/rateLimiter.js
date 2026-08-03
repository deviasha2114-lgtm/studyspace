// This file is created to provide backward compatibility for imports that don't use the .middleware suffix
const { chatRateLimiter, socketChatRateLimiter } = require('./rateLimiter.middleware');

module.exports = { chatRateLimiter, socketChatRateLimiter };