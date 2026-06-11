const db = require('../config/db');

const logger = async (req, res, next) => {
  const start = Date.now();


  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - start;
      const userId = req.user ? req.user.userId : null;

      console.log('Logging request:', req.method, req.originalUrl, res.statusCode); 

      await db.query(
        `INSERT INTO request_logs 
        (ip, method, route, status_code, response_time, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.ip,
          req.method,
          req.originalUrl,
          res.statusCode,
          responseTime,
          userId
        ]
      );

    } catch (err) {
      console.error('Logger error:', err);
    }
  });

  next();
};

module.exports = logger;