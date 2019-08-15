/* global supertest */

const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', () => {
  let db;

  const { testUsers } = helpers.makeAll();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsers(db, testUsers);
    });

    const requireFields = ['username', 'password'];

    requireFields.forEach(field => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      };

      it('responds with 400 required error when ${field} is missing', () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, { error: `Missing ${field} in request body`});
      });
    });

    it('responds with 400 "incorrect username or password" when bad password', () => {
      const userInvalidPassword = { username: testUser.username, password: 'invalidPass' };

      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPassword)
        .expect(400, { error: 'Incorrect username or password' });
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const userValidCredentials = {
        username: testUser.username,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        {user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        }
      );

      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCredentials)
        .expect(200, {
          authToken: expectedToken,
        });
    });

    describe('POST /api/auth/refresh', () => {
      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers);
      });
    });

    it('responds 200 and JWT auth token using secret', () => {
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256'
        }
      );

      return supertest(app)
        .post('/api/auth/refresh')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});