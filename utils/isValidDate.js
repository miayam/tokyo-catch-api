const isValidDate = dateString => new Date(dateString)
    .toString() !== 'Invalid Date';

module.exports = isValidDate;