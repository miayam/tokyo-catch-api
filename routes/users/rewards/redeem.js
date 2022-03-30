const router = require('express').Router();

router.patch('/', async (req, res) => {
  res.json({ userId: req.userId, rewardId: req.rewardId });
});

module.exports = router;