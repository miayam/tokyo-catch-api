const router = require('express').Router();
const rewards = require('./rewards');

router.get('/:userId', async (req, res) => {
  res.json({ userId: req.params.userId });
});

router.use('/:userId/rewards', async (req, _, next) => {
  req.userId = req.params.userId;
  next();
}, rewards);

module.exports = router;