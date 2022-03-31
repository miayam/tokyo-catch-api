const router = require('express').Router();
const rewards = require('./rewards');
const NodeCache = require('node-cache');

// stdTTL is the default time-to-live for each cache entry
const cache = new NodeCache({ stdTTL: 0 });

router.get('/:userId', async (req, res) => {
  res.json({ userId: req.params.userId });
});

router.use('/:userId/rewards', async (req, _, next) => {
  req.userId = req.params.userId;
  req.cache = cache;
  next();
}, rewards);

module.exports = router;