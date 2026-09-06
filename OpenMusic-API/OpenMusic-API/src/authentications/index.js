const AuthenticationsHandler = require('./handler');
const routes = require('./routes');
const AuthenticationsService = require('../service/AuthenticationsService');
const UsersService = require('../service/UsersService');
const TokenManager = require('../tokenize/TokenManager');
const {
  validatePostAuthenticationPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload,
} = require('./validator');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server) => {
    const authenticationsService = new AuthenticationsService();
    const usersService = new UsersService();
    const authenticationsValidator = {
      validatePostAuthenticationPayload,
      validatePutAuthenticationPayload,
      validateDeleteAuthenticationPayload,
    };
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      TokenManager,
      authenticationsValidator,
    );
    server.route(routes(authenticationsHandler));
  },
};