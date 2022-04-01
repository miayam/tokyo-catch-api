/**
 * Validate Date object with parameter passed down to it. 
 * @param {string} dateParam - A parameter to create Date object. Most likely ISO 8061 format.
 * @returns {boolean} - Is it a valid date object?
 */
const isValidDate = dateParam => new Date(dateParam)
    .toString() !== 'Invalid Date';

module.exports = isValidDate;