/* global supertest expect */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Students Endpoints', () => {
  let db; 

  const {
    testUsers, 
    testStudents
  } = helpers.makeAll();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () =>  helpers.cleanTables(db));

  describe('GET /api/students', () => {
    context('Given no students', () => {

      beforeEach(() => {
        return helpers.seedUsers(db, testUsers);
      });

      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/students')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are students in the database', () => {
      beforeEach('insert students and users', () => {
        helpers.seedStudentsAndUsers(db, testUsers, testStudents);
      });

      it('responds with 200 and all of the corresponding students', () => {
        const expectedStudents = testStudents.filter(student => student.sprout_user_id === testUsers[0].id);
        return supertest(app)
          .get('/api/students')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect( 200, expectedStudents);
      });
    });
  });

  describe('POST /api/students', () => {
    beforeEach('seed users', () => {
      helpers.seedUsers(db, testUsers);
    });

    context('Given a student', () => {
      it('responds with 201 and created student', () => {
        const validStudent = {
          name: 'ValidName',
          goal: '',
          priority: '',
          sprout_user_id: 1
        };

        return supertest(app)
          .post('/api/students')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(validStudent)
          .expect(201)
          .expect(res => {
            return db
              .from('sprout_students')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.name).to.eql(validStudent.name);
                expect(row.goal).to.eql(validStudent.goal);
                expect(row.priority).to.eql(validStudent.priority);
                expect(row.sprout_user_id).to.eql(validStudent.sprout_user_id);
              });
          });
      });
    });
  });

  describe('DELETE /api/students/:studentId', () => {

    beforeEach('insert students and users', () => {
      helpers.seedStudentsAndUsers(db, testUsers, testStudents);
    });

    context('Given valid student id', () => {
      const validId = '1';

      return supertest(app)
        .delete(`/api/students/${validId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(204);

    });
  });

  describe('PATCH /api/students/:studeintId', () => {

    beforeEach('insert students and users', () => {
      helpers.seedStudentsAndUsers(db, testUsers, testStudents);
    });

    context('Given valid data', () => {
      const student = {
        id: 1,
        name: 'name',
        goal: '',
        priority: '',
        sprout_user_id: 1
      };

      return supertest(app)
        .patch(`/api/students/${student.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(student)
        .expect(204);
    });
  });
});