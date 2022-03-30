const router = require('express').Router();
const redeem = require('./redeem');

router.get('/:rewardId', async (req, res) => {
  res.json({ rewardId: req.params.rewardId, userId: req.userId });
});

router.use('/:rewardId/redeem', async (req, _, next) => {
  req.rewardId = req.params.rewardId;
  next();
}, redeem);

module.exports = router;