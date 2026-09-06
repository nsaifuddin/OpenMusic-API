const SongsHandler = require('./handler');
const routes = require('./routes');
const SongsService = require('../service/SongsService');
const { validateSongPayload } = require('./validator');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server) => {
    const songsService = new SongsService();
    const songsHandler = new SongsHandler(songsService, { validateSongPayload });
    server.route(routes(songsHandler));
  },
};