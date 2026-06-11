const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// API Key generate karo
router.post('/generate', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    const key = `ak_${uuidv4().replace(/-/g, '')}`;

    const result = await db.query(
      `INSERT INTO api_keys (key, user_id, name) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [key, userId, name]
    );

    res.json({ 
      message: 'API Key generated!',
      apiKey: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Apni saari keys dekho
router.get('/list', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT id, name, key, is_active, created_at, last_used 
       FROM api_keys 
       WHERE user_id = $1`,
      [userId]
    );

    res.json({ apiKeys: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API Key revoke karo
router.patch('/revoke/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `UPDATE api_keys 
       SET is_active = FALSE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API Key nahi mili!' });
    }

    res.json({ message: 'API Key revoked!', apiKey: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;