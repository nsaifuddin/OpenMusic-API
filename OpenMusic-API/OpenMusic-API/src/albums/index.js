const AlbumsHandler = require('./handler');
const routes = require('./routes');
const AlbumsService = require('../service/AlbumsService');
const CacheService = require('../service/CacheService');
const StorageService = require('../service/storage/StorageService');
const UploadsValidator = require('../validator/uploads');
const { validateAlbumPayload } = require('./validator');
const path = require('path');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server) => {
    const cacheService = new CacheService();
    const albumsService = new AlbumsService(cacheService);
    const storageService = new StorageService(path.resolve(__dirname, '../service/storage'));

    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      { validateAlbumPayload },
      UploadsValidator,
    );
    server.route(routes(albumsHandler));
  },
};