const services = {
  '/users': {
    target: 'http://localhost:4001',
    name: 'User Service'
  },
  '/products': {
    target: 'http://localhost:4002',
    name: 'Product Service'
  },
  '/orders': {
    target: 'http://localhost:4003',
    name: 'Order Service'
  }
};

module.exports = services;