const { hasRedis } = require('../lib/push.js');
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const publicKey = process.env.VAPID_PUBLIC_KEY || null;
  res.status(200).json({ publicKey, redis: hasRedis(), ready: !!(publicKey && process.env.VAPID_PRIVATE_KEY && hasRedis()) });
};
