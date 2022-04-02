// You need to set mergeParams: true on the router,
// if you want to access params from the parent router
const router = require('express').Router({ mergeParams: true });
const redeem = require('./redeem');
const createRewardsFor7Days = require('../../../utils/createRewardsFor7Days');
const isValidDate = require('../../../utils/isValidDate');

router.get('/', async (req, res) => {
  // example: ?at=2020-03-19T12:00:00Z
  const { cache, query, params } = req;
  const { userId } = params;
  const { at: iso8061Format } = query;

  // To check cache
  const hasCache = cache.has(userId);
  const noCache = !hasCache;

  // To check date
  const hasDate = Boolean(iso8061Format);
  const noDate = !hasDate; // `query.at` is undefined or null
  const invalidDate = noDate || !isValidDate(iso8061Format);
  const validDate = hasDate && isValidDate(iso8061Format);
  const cachedIso8061Format = cache.get(userId) ? cache.get(userId).replace(`${userId}-at-`, '') : null;
  const sameDate = iso8061Format === cachedIso8061Format;
  const differentDate = iso8061Format !== cachedIso8061Format;

  // Clarify the logic.
  const noCacheButHasValidDate = noCache && validDate;
  const noCacheAndHasInvalidDate = noCache && invalidDate;
  const hasCacheWithInvalidDate = hasCache && invalidDate
  const hasCacheWithSameValidDate = hasCache && validDate && sameDate
  const hasCacheWithDifferentValidDate = hasCache && validDate && differentDate

  if (hasCacheWithInvalidDate || hasCacheWithSameValidDate) {
    console.log('Get rewards from cache...');
    const key = cache.get(userId);
    res.set('from-cache', 'yes');
    res.set('Access-Control-Expose-Headers', 'from-cache');
    res.status(200).json({ data: cache.get(key) });
  }
  
  // Need to renew rewards for certain `userId` or just create new one.
  if (noCacheButHasValidDate || hasCacheWithDifferentValidDate) {
    console.log('Create new rewards...');
    const data = createRewardsFor7Days(iso8061Format);
    const key = `${userId}-at-${iso8061Format}`; 
    cache.set(userId, key);
    cache.set(key, data);
    res.set('from-cache', 'no');
    res.set('Access-Control-Expose-Headers', 'from-cache');
    res.status(200).json({ data });
  }

  if (noCacheAndHasInvalidDate) {
    res.status(422).json({
      error: {
        message: "You don't have any rewards"
      }
    });
  }
});

router.use('/:rewardId/redeem', redeem);

module.exports = router;