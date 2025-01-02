const {databaseName} = require('../../config/config.js');

const MONGODB = {
  mongoUri: `mongodb://localhost/${databaseName}`,
};

const JWT = {
  secretOrKey: process.env.JWT_SECRET_KEY || 'secret',
  expiresIn: process.env.JWT_EXPIRES_IN || undefined
};

module.exports = {
  MONGODB,
  JWT,
};
