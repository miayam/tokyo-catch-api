const router = require('express').Router();
const redeem = require('./redeem');
const createRewardsFor7Days = require('../../../utils/createRewardsFor7Days');
const isValidDate = require('../../../utils/isValidDate');

router.get('/', async (req, res) => {
  // example: ?at=2020-03-19T12:00:00Z
  const { cache, query, userId } = req;
  const isoString = query.at;

  // To check cache
  const hasCache = cache.has(userId);
  const noCache = !hasCache;

  // To check date
  const hasDate = Boolean(isoString);
  const noDate = !hasDate; // `query.at` is undefined or null
  const invalidDate = noDate || !isValidDate(isoString);
  const validDate = hasDate && isValidDate(isoString);
  const sameDate = isoString === cache.get(userId);
  const differentDate = isoString !== cache.get(userId);

  // Clarify the logic.
  const noCacheButHasValidDate = noCache && validDate;
  const noCacheAndHasInvalidDate = noCache && invalidDate;
  const hasCacheWithInvalidDate = hasCache && invalidDate
  const hasCacheWithSameValidDate = hasCache && validDate && sameDate
  const hasCacheWithDifferentValidDate = hasCache && validDate && differentDate

  if (hasCacheWithInvalidDate || hasCacheWithSameValidDate) {
    console.log('Get rewards from cache...');
    const key = cache.get(userId);
    res.json({ data: cache.get(key) });
  }
  
  // Need to renew rewards for certain `userId` or just create new one.
  if (noCacheButHasValidDate || hasCacheWithDifferentValidDate) {
    console.log('Create new rewards...');
    const data = createRewardsFor7Days(isoString);
    cache.set(userId, isoString);
    cache.set(isoString, data);
    res.json({ data });
  }

  if (noCacheAndHasInvalidDate) {
    res.json({
      error: {
        message: "You don't have any rewards"
      }
    });
  }
});

router.use('/:rewardId/redeem', async (req, _, next) => {
  req.rewardId = req.params.rewardId;
  next();
}, redeem);

module.exports = router;