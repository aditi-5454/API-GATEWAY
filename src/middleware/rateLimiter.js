const redis = require('../config/redis');

const rateLimiter = (maxRequests, windowSeconds) => {
  return async (req, res, next) => {
    try {
      
      const key = `rate_limit:${req.ip}`;
      const now = Date.now(); 
      const windowMs = windowSeconds * 1000;

      
      const pipeline = redis.pipeline();

      
      pipeline.zremrangebyscore(key, 0, now - windowMs);

      
      pipeline.zadd(key, now, `${now}`);

      
      pipeline.zcard(key);

      
      pipeline.expire(key, windowSeconds);

      const results = await pipeline.exec();

      
      const requestCount = results[2][1];

      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));

      if (requestCount > maxRequests) {
        return res.status(429).json({
          error: 'Bahut zyada requests! Thoda ruko.',
          retryAfter: `${windowSeconds} seconds`
        });
      }

      next();

    } catch (err) {
      console.error('Rate limiter error:', err);
      next(); 
    }
  };
};

module.exports = rateLimiter;