// This file is created to provide backward compatibility for imports that don't use the .middleware suffix
const { isMember } = require('./isMember.middleware');

module.exports = { isMember };