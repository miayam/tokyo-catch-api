const router = require('express').Router();
const users = require('./users');
const NodeCache = require('node-cache');

// stdTTL is the default time-to-live for each cache entry
const cache = new NodeCache({ stdTTL: 0 });

router.use('/users', async (req, _, next) => {
  req.cache = cache; // With this, children routers can access the same NodeCache instance.
  next();
}, users);

module.exports = router;