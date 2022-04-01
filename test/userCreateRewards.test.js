const request = require('supertest');
const app = require('../app');

describe('User get rewards', () => {
  it('gets /users/:userId', (done) => {
    request(app)
      .get('/users/1')
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.userId).toBe('1');
      })
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });

  it(`
    gets error when accessing /users/:userId/rewards
    for the first time without ?at=
  `, (done) => {
    request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });

  it(`
    gets error when accessing /users/:userId/rewards
    for the first time with invalid ?at=
  `, (done) => {
    request(app)
      .get('/users/1/rewards?at=fafifuwasweswos') // ?at is not ISO 8061 format
      .expect("Content-Type", /json/)
      .expect(422)
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });

  it(`
    gets rewards data when accessing /users/:userId/rewards
    for the first time with valid ?at=
  `, (done) => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z';
    const url = `/users/1/rewards?at=${iso8061Format}`;

    // Act and assert
    request(app)
      .get(url) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      })
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });

  it(`
    gets rewards data when accessing /users/:userId/rewards
    without ?at for the second time because it has been
    cached by server
  `, (done) => {
    // Arrange
    const iso8061Format = '2020-03-20T12:00:00Z';
    const firstAttemptURL = `/users/1/rewards?at=${iso8061Format}`;

    // Request endpoint for the first time.
    request(app)
      .get(firstAttemptURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); // Create new rewards
      })

      .end((err) => {
        if (err) return done(err);
        return done();
      });
    
    // Request endpoint for the second time expecting data stored in cache.
    request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); // Get rewards from cache
      })
      .end((err) => {
        if (err) return done(err);
        return done();
      });
  });
});