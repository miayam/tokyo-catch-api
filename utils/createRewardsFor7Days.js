const isValidDate = require('./isValidDate');

/**
 * 7 days of rewards for our repeat customers
 * @param {string} isoString - ISO 8061 date format
 * @returns {Object[]} Array of rewards object stored in node-cache 
 */
const createRewardsFor7Days = (isoString) => {
  if (!isValidDate(isoString)) {
    return [];
  }

  const date = new Date(isoString);
  const daysIndexes = [0, 1, 2, 3, 4, 5, 6]; // From Sunday to Saturday. Sunday === 0

  // Start at midnight (00:00:00.000).
  date.setUTCHours(0, 0, 0, 0);

  const passedDownDayIndex = date.getUTCDay();

  const data = daysIndexes.map(dayIndex => {
    const diff = dayIndex - passedDownDayIndex;
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(newDate.getUTCDate() + diff);

    return {
      availableAt: newDate.toISOString().replace(/[.]\d+/, ''), // Remove miliseconds
      redeemedAt: null,
      expiresAt: new Date(
        newDate.setUTCDate(
          newDate.getUTCDate() + 1
        )
      ).toISOString().replace(/[.]\d+/, ''), // Remove miliseconds
    };
  });

  return data;
};

module.exports = createRewardsFor7Days;