const router = require('express').Router();
const redeem = require('./redeem');
const createRewardsFor7Days = require('../../../utils/createRewardsFor7Days');

router.get('/', async (req, res) => {
  // example: ?at=2020-03-19T12:00:00Z
  const { cache, query } = req;
  const isoString = query.at;
  const key = `${req.userId}-at-${isoString}`;

  if (cache.has(key)) {
    console.log('Get rewards from cache...');
    res.json({ data: cache.get(key) });
  } else {
    console.log('Create new rewards...');
    const data = createRewardsFor7Days(isoString);
    cache.set(key, data);
    res.json({ data });
  }
});

router.use('/:rewardId/redeem', async (req, _, next) => {
  req.rewardId = req.params.rewardId;
  next();
}, redeem);

module.exports = router;