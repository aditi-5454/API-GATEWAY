const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();


router.get('/stats', auth, async (req, res) => {
  try {
    
    const totalRequests = await db.query(
      `SELECT COUNT(*) as total FROM request_logs`
    );

    
    const statusCodes = await db.query(
      `SELECT status_code, COUNT(*) as count 
       FROM request_logs 
       GROUP BY status_code 
       ORDER BY count DESC`
    );

    const topRoutes = await db.query(
      `SELECT route, COUNT(*) as count 
       FROM request_logs 
       GROUP BY route 
       ORDER BY count DESC 
       LIMIT 5`
    );

   
    const topIPs = await db.query(
      `SELECT ip, COUNT(*) as count 
       FROM request_logs 
       GROUP BY ip 
       ORDER BY count DESC 
       LIMIT 5`
    );

   
    const avgResponseTime = await db.query(
      `SELECT ROUND(AVG(response_time)) as avg_ms 
       FROM request_logs`
    );

    res.json({
      totalRequests: totalRequests.rows[0].total,
      statusCodes: statusCodes.rows,
      topRoutes: topRoutes.rows,
      topIPs: topIPs.rows,
      avgResponseTime: `${avgResponseTime.rows[0].avg_ms}ms`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/recent', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT route, method, status_code, response_time, ip, created_at
       FROM request_logs
       WHERE created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({ recentRequests: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;