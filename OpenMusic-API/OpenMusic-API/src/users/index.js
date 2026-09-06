const UsersHandler = require('./handler');
const routes = require('./routes');
const UsersService = require('../service/UsersService');
const { validateUserPayload } = require('./validator');

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server) => {
    const usersService = new UsersService();
    const usersHandler = new UsersHandler(usersService, { validateUserPayload });
    server.route(routes(usersHandler));
  },
};