const request = require('supertest');
const app = require('../app');

describe('User redeems a reward', () => {
  it(`
    redeems a reward with valid parameter when it's
    still available and not expired
    /users/:userId/rewards/:rewardId/redeem
  `, async () => {
    // Arrange
    const now = new Date();
    const iso8061Format = now.toISOString();
    const url = `/users/1/rewards?at=${iso8061Format}`;

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
    const redeemUrl = `/users/1/rewards/${redeemId}/redeem`;

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
});