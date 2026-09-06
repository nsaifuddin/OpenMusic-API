const ExportsHandler = require('./handler');
const routes = require('./routes');
const ProducerService = require('../service/mq/ProducerService');
const PlaylistsService = require('../service/PlaylistsService');
const ExportsValidator = require('./validator');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { playlistsService }) => {
    const exportsHandler = new ExportsHandler(
      ProducerService,
      playlistsService,
      ExportsValidator,
    );
    server.route(routes(exportsHandler));
  },
};