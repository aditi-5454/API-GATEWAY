const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

const router = express.Router();


Object.keys(services).forEach((route) => {
  const { target, name } = services[route];

  console.log(`🔗 Registering service: ${name} → ${route} → ${target}`);

  router.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          console.error(`❌ Proxy error for ${name}:`, err.message);
          res.status(502).json({
            error: 'Service unavailable',
            service: name
          });
        }
      }
    })
  );
});

module.exports = router;