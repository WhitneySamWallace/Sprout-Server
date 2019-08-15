/* global supertest expect */
const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', () => {
  let db;

  const { testUsers } = helpers.makeAll();
  const testUser = testUsers[0];

  before('making knext instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/users', () => {
    context('User Validation', () => {
      beforeEach('insert users', () => {
        return helpers.seedUsers(
          db,
          testUsers
        );
      });

      const requiredFields = ['username', 'password', 'email'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          username: 'TestUsername',
          password: 'Test1password!',
          email: 'test@email.com'
        };

        it(`responds with 400 required error when ${field} is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, { error: `Missing ${field} in request body`});
        });
      });
    });

    it('responds 400 "Password must be longer than 8 characters" when password is between 1-7 characters', () => {
      const shortPassword = {
        username: 'TestUsername', 
        password:'1234567',
        email: 'test@email.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(shortPassword)
        .expect(400, { error: 'Password must be longer than 8 characters'});
    });

    it('responds 400 "Password must be shorter than 72 characters" when password is over 72 characters', () => {
      const longPassword = {
        username: 'TestUsername', 
        password: '*'.repeat(73),
        email: 'test@email.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(longPassword)
        .expect(400, { error: 'Password must be shorter than 72 characters'});
    });

    it('responds 400 "Password must not start or end with empty spaces" when password starts with an empty space', () => {
      const spacePassword = {
        username: 'TestUsername',
        password: ' spacepassword',
        email: 'test@email.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(spacePassword)
        .expect(400, { error: 'Password must not start or end with empty spaces'});
    });

    it('responds 400 "Password must not start or end with empty spaces" when password ends with an empty space', () => {
      const spacePassword = {
        username: 'TestUsername',
        password: 'spacepassword ',
        email: 'test@email.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(spacePassword)
        .expect(400, { error: 'Password must not start or end with empty spaces' });
    });

    context('Password complexity check', () => {
      const passwordCheck = ['noupperc4se!', 'NOLOWERC4SE!', 'NoNumber!', 'NoSp3cial'];

      passwordCheck.forEach(password => {
        const simplePassword = {
          username: 'TestUsername',
          password: password,
          email: 'test@email.com'
        };

        it('responds 400 "Password must contain 1 upper case, lower case, number and special character" when password is simple', () => {
          return supertest(app)
            .post('/api/users')
            .send(simplePassword)
            .expect(400, {error: 'Password must contain 1 upper case, lower case, number and special character'});
        });

        context('Inserting users', () => {
          before('insert users', () => {
            return helpers.seedUsers(db, testUsers);
          });

          it('responds 400 "Username already exists" if the username already exists', () => {
            const alreadyExists = {
              username: testUser.username,
              password: '11AAaa!!',
              email: 'user@email.com'
            };

            return supertest(app)
              .post('/api/users')
              .send(alreadyExists)
              .expect(400, { error: 'Username already exists'});
          });
        });

        context('Happy path', () => {
          it('responds 201, serialized user, storing bcrypted password', () => {
            const newUser = {
              username: 'TestUser1',
              password: '11AAaa!!',
              email: 'user@email.com'
            };

            return supertest(app)
              .post('/api/users')
              .send(newUser)
              .expect(201)
              .expect(res => {
                expect(res.body).to.have.property('id');
                expect(res.body.username).to.eql(newUser.username);
                expect(res.body.email).to.eql(newUser.email);
                expect(res.body).to.not.have.property('password');
              })
              .expect(res => {
                return db('sprout_users')
                  .select('*')
                  .where({ id: res.body.id })
                  .first()
                  .then(row => {
                    expect(row.username).to.eql(newUser.username);
                    expect(row.email).to.eql(newUser.email);

                    return bcrypt.compare(newUser.password, row.password);
                  })
                  .then(compareMatch => {
                    expect(compareMatch).to.be.true;
                  });
              });
          });
        });
      });
    });
  });
});