/* global supertest */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected Endpoints', () => {
  let db;

  const {
    testUsers,
    testStudents
  } = helpers.makeAll();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
  
  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach('insert students and users', () => {
    return helpers.seedStudentsAndUsers(
      db, testUsers, testStudents
    );
  });

  const protectedEndpoints = [
    {
      name: 'GET /api/students',
      path: '/api/students',
      method: supertest(app).get
    },
    {
      name: 'POST /api/students',
      path: '/api/students',
      method: supertest(app).post
    },
    {
      name: 'DELETE /api/students/:studentId',
      path: '/api/students/:studentId',
      method: supertest(app).delete
    },
    {
      name: 'POST /api/auth/refresh',
      path: '/api/auth/refresh',
      method: supertest(app).post
    }
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('responds with 401 "Missing bearer token" when no bearer token', () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 "Unauthorized request" when invalid JWT secret', () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: 'Unauthorized request' });
      });

      it('repsonds 401 "Unauthorized request" when invalid sub in payload', () => {
        const invalidUser = { username: 'doesNotExist', id: 1 };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});