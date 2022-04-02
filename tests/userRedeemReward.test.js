const request = require('supertest');
const app = require('../app');

describe('Users redeem a reward', () => {
  test(`
    users get error message when they try to redeem
    a reward they don't deserve.
    PATCH /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z';
    const url = `/users/2/rewards/${iso8061Format}/redeem`;

    await request(app)
      .patch(url)
      .expect("Content-Type", /json/)
      .expect(422);
  });

  test(`
    users redeem a reward with valid parameter as long as
    the reward is still available and has yet to be expired.
    PATCH /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const date = new Date();
    const iso8061Format = date.toISOString();
    const url = `/users/2/rewards?at=${iso8061Format}`;

    // Create rewards first
    const rewardsResponse = await request(app)
      .get(url)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      });
    
    // Arrange
    date.setUTCHours(0, 0, 0, 0); // To get today's reward ID, we must starts date at midnight.
    const myRewards = rewardsResponse.body.data;
    const todayISOString = date.toISOString().replace(/[.]\d+/, ''); // Remove miliseconds.
    const index = myRewards.findIndex((reward) => reward.availableAt === todayISOString);
    const reward = myRewards[index];
    const rewardId = reward.availableAt;
    const redeemUrl = `/users/2/rewards/${rewardId}/redeem`;

    // Users can redeem a reward because new rewards was created a couple of seconds ago
    // and 100% available to be redeemed and 100% not expired.
    await request(app)
      .patch(redeemUrl)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        const redeemedReward = res.body.data;
        expect(redeemedReward.redeemedAt).not.toBeNull();
      });
  });

  test(`
    users redeem a reward with valid parameter but it's
    not available yet.
    PATCH /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 100); // 100 days into the future.
    const iso8061Format = date.toISOString();
    const url = `/users/2/rewards?at=${iso8061Format}`;

    // Create rewards first
    const rewardsResponse = await request(app)
      .get(url)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      });
    
    // Arrange
    const myRewards = rewardsResponse.body.data;
    const reward = myRewards[0];
    const rewardId = reward.availableAt;
    const redeemUrl = `/users/2/rewards/${rewardId}/redeem`;

    // Users cannot redeem a reward that's not available yet. Must redeem that reward 100 days later.
    await request(app)
      .patch(redeemUrl)
      .expect("Content-Type", /json/)
      .expect(422)
      .expect((res) => {
        expect(res.body.error.message).toBe("This reward is not available yet");
      });
  });

  test(`
    users try to redeem a reward with valid parameter but it's
    been expired and the reward cannot be redeemed.
    PATCH /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const iso8061Format = '1945-08-17T00:00:00Z'; // At the very own Indonesian independence date.
    const url = `/users/2/rewards?at=${iso8061Format}`;

    // Create rewards first
    const rewardsResponse = await request(app)
      .get(url)
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(7);
      });
    
    // Arrange
    const myRewards = rewardsResponse.body.data;
    const firstReward = myRewards[0];
    const rewardId = firstReward.availableAt;
    const redeemUrl = `/users/2/rewards/${rewardId}/redeem`;

    // Users cannot redeem a reward that's been expired a long time ago (Fri Aug 17 1945)
    await request(app)
      .patch(redeemUrl)
      .expect("Content-Type", /json/)
      .expect(422)
      .expect((res) => {
        expect(res.body.error.message).toBe("This reward is already expired");
      });
  });
});