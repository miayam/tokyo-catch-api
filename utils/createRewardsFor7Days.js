const isValidDate = require('./isValidDate');

/**
 * 7 days of rewards for our repeat customer
 * @param {string} isoString - ISO 8061 date format
 * @returns {Object[]} Array of rewards object stored in node-cache 
 */
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
        availableAt: date.toISOString().replace(/[.]\d+/, ''), // Remove miliseconds
        redeemedAt: null,
        expiresAt: new Date(
          date.setUTCDate(
            date.getUTCDate() + 1
          )
        ).toISOString().replace(/[.]\d+/, ''), // Remove miliseconds
      }
    });
  
  return data;
};

module.exports = createRewardsFor7Days;