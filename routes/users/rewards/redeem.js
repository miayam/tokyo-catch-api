const router = require('express').Router();

router.patch('/', async (req, res) => {
  const { cache, userId, rewardId } = req;

  const hasCache = cache.has(userId);
  const noCache = !hasCache;

  const key = cache.get(userId);
  const data = hasCache ? cache.get(key) : [];
  const index = data.findIndex((item => item.availableAt === rewardId));
  const rewardFound = index >= 0;
  const rewardNotFound = index < 0;
  const hasCacheButRewardNotFound = hasCache && rewardNotFound;
  const hasCacheAndRewardFound = hasCache && rewardFound; 

  if (noCache || hasCacheButRewardNotFound) {
    res.json({
      error: {
        message: "You cannot redeem a reward you don't have"
      }
    });
  }

  const availableTime = new Date(data[index].availableAt).getTime();
  const expiredTime = new Date(data[index].expiresAt).getTime();
  const nowTime = new Date().getTime();
  const canBeRedeemed = nowTime >= availableTime && nowTime <= expiredTime;
  const cannotBeReedeemed = !canBeRedeemed;
  
  if (hasCacheAndRewardFound && canBeRedeemed) {
    const newData = [...data];
    const now = new Date();

    newData[index] = {
      ...newData[index],
      redeemedAt: now.toISOString()
    };

    cache.set(key, newData);

    res.json({ data: newData[index] });
  }

  if (hasCacheAndRewardFound && cannotBeReedeemed) {
    res.json({
      error: {
        message: "This reward is already expired"
      }
    });
  }
});

module.exports = router;