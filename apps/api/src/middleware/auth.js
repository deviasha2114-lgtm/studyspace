// This file is created to provide backward compatibility for imports that don't use the .middleware suffix
const { authenticate, authenticateSocket, protect } = require('./auth.middleware');

module.exports = { authenticate, authenticateSocket, protect };