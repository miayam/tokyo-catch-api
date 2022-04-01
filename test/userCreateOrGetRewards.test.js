const request = require('supertest');
const app = require('../app');

describe('User create new rewards or get rewards from cache', () => {
  it('gets /users/:userId', async () => {
    await request(app)
      .get('/users/1')
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.userId).toBe('1');
      });
  });

  it(`
    sends error when accessing /users/:userId/rewards
    for the first time without ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(422);
  });

  it(`
    sends error when accessing /users/:userId/rewards
    for the first time with invalid ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards?at=fafifuwasweswos') // ?at is not ISO 8061 format
      .expect("Content-Type", /json/)
      .expect(422);
  });

  it(`
    sends rewards for 7 days when accessing /users/:userId/rewards
    for the first time with valid ?at=
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

  it(`
    sends rewards for 7 days when accessing /users/:userId/rewards
    without ?at for the second time because it has been
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