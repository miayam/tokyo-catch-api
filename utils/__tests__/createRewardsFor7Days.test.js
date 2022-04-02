const createRewardsFor7Days = require('../createRewardsFor7Days');

describe('createRewardsFor7Days', () => {
  it("should create rewards if a parameter passed down is valid format", () => {
    // Arrange
    const now = new Date();
    const iso8061Format = '2020-03-19T12:00:00Z';
    const timestamp = now.getTime();
    const dateString = '1988-03-21';

    expect(createRewardsFor7Days(iso8061Format).length).toBe(7);
    expect(createRewardsFor7Days(timestamp).length).toBe(7);
    expect(createRewardsFor7Days(dateString).length).toBe(7);
  });

  it("should create rewards with expected data form", () => {
    const iso8061Format = '2020-03-20T12:00:00Z'; // Friday (2020-03-20 not a first index)
    const expectedRewardsData = [
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
        availableAt: "2020-03-19T00:00:00Z", // Thursday
        redeemedAt: null,
        expiresAt: "2020-03-20T00:00:00Z"
      }, 
      {
        availableAt: "2020-03-20T00:00:00Z", // Friday (2020-03-20 not a first index)
        redeemedAt: null,
        expiresAt: "2020-03-21T00:00:00Z"
      },
      {
        availableAt: "2020-03-21T00:00:00Z", // Saturday
        redeemedAt: null,
        expiresAt: "2020-03-22T00:00:00Z"
      }
    ];

    const myRewards = createRewardsFor7Days(iso8061Format);

    expect(myRewards.length).toBe(7);
    expect(JSON.stringify(myRewards)).toBe(JSON.stringify(expectedRewardsData));
  });

  it("should start at midnight if ISO 8061 format passed down", () => {
    // Arrange
    const iso8061Format = '2020-03-19T12:00:00Z'; // 12 PM (UTC)
    const expectedValue = '2020-03-19T00:00:00Z'; // 12 AM (UTC)
    const atMidnight = 0; // date.getUTCHours() === 0 means the date is at midnight

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
    const index = data.findIndex(reward => reward.availableAt === expectedValue);
    const reward = data[index];

    // Assert
    expect(reward.availableAt).toBe(expectedValue);
    expect(reward.availableAt).not.toBe(notExpectedValue);
  });

  it("should not create rewards if parameter is not valid date string format", () => {
    // Arrange
    const undefinedValue = undefined;
    const randomString = "fa fi fu was wes wos";

    expect(createRewardsFor7Days(undefinedValue).length).toBe(0);
    expect(createRewardsFor7Days(randomString).length).toBe(0);
  });
});