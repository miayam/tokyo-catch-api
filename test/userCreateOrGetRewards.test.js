const request = require('supertest');
const app = require('../app');

describe('User create new rewards or get rewards from cache', () => {
  test(`
    user gets userId when accessing /users/:userId
  `, async () => {
    await request(app)
      .get('/users/1')
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(Number(res.body.userId)).toBe(1);
      });
  });

  test(`
    user gets error message when accessing /users/:userId/rewards
    for the first time without proper query param ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(422);
  });

  test(`
    user gets error message when accessing /users/:userId/rewards
    for the first time with invalid query param ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards?at=fafifuwasweswos') // ?at is not ISO 8061 format
      .expect("Content-Type", /json/)
      .expect(422);
  });

  test(`
    user gets rewards for 7 days when accessing /users/:userId/rewards
    for the first time with valid query param ?at=
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z';
    const url = `/users/1/rewards?at=${iso8061Format}`;

    // Act and assert
    await request(app)
      .get(url) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      });
  });

  test(`
    user gets rewards for 7 days when accessing /users/:userId/rewards
    without query param ?at for the second time because it has been
    cached by server
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-20T12:00:00Z';
    const firstAttemptURL = `/users/1/rewards?at=${iso8061Format}`;

    // Request endpoint for the first time.
    await request(app)
      .get(firstAttemptURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); // Create new rewards
      });
    
    // Request endpoint for the second time expecting data stored in cache.
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); // Get rewards from cache
      });
  });
});