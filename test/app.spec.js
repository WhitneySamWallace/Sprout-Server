const app = require('../src/app');
// expect and supertest available globally -- see test/setup.js

describe('GET /', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!');
  });
});