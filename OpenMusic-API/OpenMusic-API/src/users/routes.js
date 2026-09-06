const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.addUserHandler,
  },
];

module.exports = routes;