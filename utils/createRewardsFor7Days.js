const createRewardsFor7Days = (isoString) => {
  const date = new Date(isoString);

  // Start at 00:00 in midnight.
  date.setUTCHours(0);

  const data = [...Array(7)]
    .map(() => {
      return {
        availableAt: date.toISOString(),
        redeemedAt: null,
        expiredAt: new Date(
          date.setUTCDate(
            date.getUTCDate() + 1
          )
        ).toISOString(),
      }
    });
  
  return data;
};

module.exports = createRewardsFor7Days;