const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const config = require('../config');

const AuthService = {
  getUserWithUserName(db, username) {
    return db('sprout_users')
      .where({ username })
      .first();
  },
  addUserToDatabase(db, newUser) {
    return db('sprout_users')
      .insert(newUser)
      .returning('*');
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject,payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256',
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  },
};

module.exports = AuthService;