const AlbumsHandler = require('./handler');
const routes = require('./routes');
const AlbumsService = require('../service/AlbumsService');
const { validateAlbumPayload } = require('./validator');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server) => {
    const albumsService = new AlbumsService();
    const albumsHandler = new AlbumsHandler(albumsService, { validateAlbumPayload });
    server.route(routes(albumsHandler));
  },
};