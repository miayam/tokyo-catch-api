const request = require('supertest');
const app = require('../app');

describe('Users create new rewards or get rewards from cache', () => {
  test(`
    users get userId when accessing /users/:userId
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
    users get error message when they GET /users/:userId/rewards
    for the first time without proper query param ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(422);
  });

  test(`
    users get error message when they GET /users/:userId/rewards
    for the first time with invalid query param ?at=
  `, async () => {
    await request(app)
      .get('/users/1/rewards?at=fafifuwasweswos') // ?at is not ISO 8061 format
      .expect("Content-Type", /json/)
      .expect(422);
  });

  test(`
    users get weekly rewards (7 days) when they GET /users/:userId/rewards
    for the first time with valid query param ?at=
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z'; // Thursday (2020-03-19 not a first index)
    const url = `/users/1/rewards?at=${iso8061Format}`;

    const expectedResponseBody = {
      data: [
        {
          availableAt: "2020-03-15T00:00:00Z", // Sunday
          redeemedAt: null,
          expiresAt: "2020-03-16T00:00:00Z"
        }, 
        {
          availableAt: "2020-03-16T00:00:00Z", // Monday
          redeemedAt: null,
          expiresAt: "2020-03-17T00:00:00Z"
        },
        {
          availableAt: "2020-03-17T00:00:00Z", // Tuesday
          redeemedAt: null,
          expiresAt: "2020-03-18T00:00:00Z"
        },
        {
          availableAt: "2020-03-18T00:00:00Z", // Wednesday
          redeemedAt: null,
          expiresAt: "2020-03-19T00:00:00Z"
        },
        {
          availableAt: "2020-03-19T00:00:00Z", // Thursday (2020-03-19 not a first index)
          redeemedAt: null,
          expiresAt: "2020-03-20T00:00:00Z"
        }, 
        {
          availableAt: "2020-03-20T00:00:00Z", // Friday
          redeemedAt: null,
          expiresAt: "2020-03-21T00:00:00Z"
        },
        {
          availableAt: "2020-03-21T00:00:00Z", // Saturday
          redeemedAt: null,
          expiresAt: "2020-03-22T00:00:00Z"
        }
      ]
    }; 

    // Act and assert
    const response = await request(app)
      .get(url) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      });

    expect(JSON.stringify(response.body)).toBe(JSON.stringify(expectedResponseBody));
  });

  test(`
    users get weekly rewards (7 days) when they GET /users/:userId/rewards
    stored in cache as long as the query param ?at= is the same as before or
    query param ?at= undefined 
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-20T12:00:00Z';
    const rewardsURL = `/users/1/rewards?at=${iso8061Format}`;

    // Request endpoint for the first time.
    await request(app)
      .get(rewardsURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); 
        expect(res.get('from-cache')).toBe('no'); // Create new rewards
      });

    // Request endpoint for the 2nd time with the same query param ?at= expecting data stored in cache.
    await request(app)
      .get(rewardsURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('yes'); // Get rewards from cache
      });

    // Request endpoint without query param ?at= for the 3rd time expecting data stored in cache.
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('yes'); // Get rewards from cache
      });
  });
});