const isValidDate = require('./isValidDate');

const createRewardsFor7Days = (isoString) => {
  if (!isValidDate(isoString)) {
    return [];
  }

  const date = new Date(isoString);

  // Start at midnight (00:00:00.000).
  date.setUTCHours(0, 0, 0, 0);

  const data = [...Array(7)]
    .map(() => {
      return {
        availableAt: date.toISOString(),
        redeemedAt: null,
        expiresAt: new Date(
          date.setUTCDate(
            date.getUTCDate() + 1
          )
        ).toISOString(),
      }
    });
  
  return data;
};

module.exports = createRewardsFor7Days;