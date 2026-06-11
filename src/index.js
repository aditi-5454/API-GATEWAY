const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const redis = require('./config/redis');
const auth = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const db = require('./config/db');
const logger = require('./middleware/logger');
const proxyRouter = require('./routes/proxy');

dotenv.config();

const app = express();
app.use(express.json());

app.use(logger);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Gateway chal raha hai!' });
});


app.post('/generate-token', (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: 'userId aur role chahiye!' });
  }

  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});



app.get('/protected', rateLimiter(5, 30), auth, (req, res) => {
  res.json({ message: 'Andar aa gaye!', user: req.user });
});

app.use('/api', rateLimiter(100, 60), auth, proxyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});