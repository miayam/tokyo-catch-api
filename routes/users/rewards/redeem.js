// You need to set mergeParams: true on the router,
// if you want to access params from the parent router
const router = require('express').Router({ mergeParams: true });

router.patch('/', async (req, res) => {
  const { cache, params } = req;
  const { userId, rewardId } = params;

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
    res.status(422).json({
      error: {
        message: "You cannot redeem a reward you don't have"
      }
    });
  }

  const availableTime = data[index] ? new Date(data[index].availableAt).getTime() : 0;
  const expiredTime = data[index] ? new Date(data[index].expiresAt).getTime() : 0;
  const nowTime = new Date().getTime();
  const notAvailableYet = nowTime < availableTime;
  const hasExpired = nowTime > expiredTime;
  const canBeRedeemed = !notAvailableYet && !hasExpired;
  
  if (hasCacheAndRewardFound && canBeRedeemed) {
    const newData = [...data];
    const now = new Date();

    newData[index] = {
      ...newData[index],
      redeemedAt: now.toISOString().replace(/[.]\d+/, ''), // Remove miliseconds
    };

    cache.set(key, newData);

    res.status(200).json({ data: newData[index] });
  }

  if (hasCacheAndRewardFound && notAvailableYet) {
    res.status(422).json({
      error: {
        message: "This reward is not available yet"
      }
    });
  }

  if (hasCacheAndRewardFound && hasExpired) {
    res.status(422).json({
      error: {
        message: "This reward is already expired"
      }
    });
  }
});

module.exports = router;