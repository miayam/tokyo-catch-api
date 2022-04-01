const request = require('supertest');
const app = require('../app');

describe('User redeems a reward', () => {
  test(`
    user gets error message when users redeem
    a reward they don't have
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
    user redeems a reward with valid parameter when it's
    still available and not expired
    /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const now = new Date();
    const iso8061Format = now.toISOString();
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
    const redeemId = firstReward.availableAt;
    const redeemUrl = `/users/2/rewards/${redeemId}/redeem`;

    // Redeem the first reward because it was created a couple of seconds ago
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
    user redeems a reward with valid parameter but it's
    not available yet
    /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const now = new Date();
    const iso8061Format = now.toISOString();
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
    const secondReward = myRewards[1]; // Tomorrow
    const redeemId = secondReward.availableAt;
    const redeemUrl = `/users/2/rewards/${redeemId}/redeem`;

    // We cannot redeem a reward that's not available today
    await request(app)
      .patch(redeemUrl)
      .expect("Content-Type", /json/)
      .expect(422)
      .expect((res) => {
        expect(res.body.error.message).toBe("This reward is not available yet");
      });
  });

  test(`
    user tries to redeem a reward with valid parameter but it's
    been expired and the reward cannot be redeemed
    /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const iso8061Format = '1945-08-17T00:00:00Z'; // The reward was created at the very own Indonesian independence date.
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
    const redeemId = firstReward.availableAt;
    const redeemUrl = `/users/2/rewards/${redeemId}/redeem`;

    // We cannot redeem a reward that's been expired long ago (Fri Aug 17 1945)
    await request(app)
      .patch(redeemUrl)
      .expect("Content-Type", /json/)
      .expect(422)
      .expect((res) => {
        expect(res.body.error.message).toBe("This reward is already expired");
      });
  });
});