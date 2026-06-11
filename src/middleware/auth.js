const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  try {
    
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'Token nahi mila!' });
    }

    
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token format galat hai! Bearer <token> chahiye' });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = decoded;

    
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid ya expired token!' });
  }
};

module.exports = auth;