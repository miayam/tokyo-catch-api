const request = require('supertest');
const app = require('../app');

describe('Users create new rewards or get rewards from cache', () => {
  test(`
    users get userId when they GET /users/:userId
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
    for the first time without query param ?at=
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
    users create new weekly rewards (7 days) when they GET /users/:userId/rewards
    for the first time with valid query param ?at=
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z'; // Thursday (2020-03-19 not the first index)
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
          availableAt: "2020-03-19T00:00:00Z", // Thursday (2020-03-19 not the first index)
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
        expect(res.get('from-cache')).toBe('no'); // Create new rewards
      });

    expect(JSON.stringify(response.body)).toBe(JSON.stringify(expectedResponseBody));
  });

  test(`
    users get weekly rewards (7 days) when they GET /users/:userId/rewards
    from cache as long as the query param ?at= is the same as the first request
    or there's no query param ?at=
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
        expect(res.get('from-cache')).toBe('no');
      });

    // Request endpoint for the 2nd time with the same query param ?at= and get rewards from cache.
    await request(app)
      .get(rewardsURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('yes');
      });

    // Request endpoint for the 3rd time without query param ?at= and get rewards from cache.
    await request(app)
      .get('/users/1/rewards') // ?at is not provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('yes');
      });
  });

  test(`
    users create new weekly rewards (7 days) when they GET /users/:userId/rewards
    if the query param ?at= is different from the first request
  `, async () => {
    // Arrange
    const date = new Date();
    const forToday = date.toISOString();

    // Act
    date.setUTCDate(date.getUTCDate() + 1);

    // Arrange
    const forTomorrow = date.toISOString();
    const firstRequestURL = `/users/1/rewards?at=${forToday}`;
    const secondRequestURL = `/users/1/rewards?at=${forTomorrow}`;

    // Request endpoint for the first time.
    await request(app)
      .get(firstRequestURL) // ?at is provided
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7); 
        expect(res.get('from-cache')).toBe('no');
      });

    // Request endpoint for the 2nd time with different query param ?at= and create new rewards.
    await request(app)
      .get(secondRequestURL) // ?at is provided but different from the first request
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('no');
      });

    // Request endpoint for the 3rd time with the same query param ?at= as the 2nd request
    // and get rewards from cache.
    await request(app)
      .get(secondRequestURL) // ?at is provided and same as the 2nd request
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
        expect(res.get('from-cache')).toBe('yes');
      });
  });
});