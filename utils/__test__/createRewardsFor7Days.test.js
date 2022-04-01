const createRewardsFor7Days = require('../createRewardsFor7Days');

describe('createRewardsFor7Days', () => {
  it("should create rewards if parameter is a valid date string format", () => {
    // Arrange
    const now = new Date();
    const iso8061Format = '2020-03-19T12:00:00Z';
    const timestamp = now.getTime();
    const dateString = '1988-03-21';

    expect(createRewardsFor7Days(iso8061Format).length).toBe(7);
    expect(createRewardsFor7Days(timestamp).length).toBe(7);
    expect(createRewardsFor7Days(dateString).length).toBe(7);
  });

  it("should start at midnight if ISO 8061 format passed down", () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z'; // 12 PM (UTC)
    const expectedValue = '2020-03-19T00:00:00Z'; // 12 AM (UTC)
    const atMidnight = 0; // at midnight

    // Act
    const data = createRewardsFor7Days(iso8061Format);
    const index = data.findIndex(reward => reward.availableAt === expectedValue);
    const myReward = data[index];
    const myRewardAvailableDate = new Date(myReward.availableAt);
    const hour = myRewardAvailableDate.getUTCHours();

    // Assert
    expect(myReward.availableAt).toBe(expectedValue);
    expect(hour).toBe(atMidnight);
  });

  it("should start at midnight but without miliseconds if ISO 8061 format passed down", () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z'; // 12 PM (UTC)
    const expectedValue = '2020-03-19T00:00:00Z'; // 12 AM (UTC)
    const notExpectedValue = '2020-03-19T00:00:00.000Z'; // 12 AM (UTC) with miliseconds

    // Act
    const data = createRewardsFor7Days(iso8061Format);
    const firstReward = data[0];

    // Assert
    expect(firstReward.availableAt).toBe(expectedValue);
    expect(firstReward.availableAt).not.toBe(notExpectedValue);
  });

  it("should not create rewards if parameter is not a valid date string format", () => {
    // Arrange
    const undefinedValue = undefined;
    const randomString = "fa fi fu was wes wos";

    expect(createRewardsFor7Days(undefinedValue).length).toBe(0);
    expect(createRewardsFor7Days(randomString).length).toBe(0);
  });
});