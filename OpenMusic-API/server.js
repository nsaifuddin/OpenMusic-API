require('dotenv').config();
const Hapi = require('@hapi/hapi');

const AlbumsService = require('./src/service/AlbumsService');
const SongsService = require('./src/service/SongsService');

const albumRoutes = require('./src/albums/routes');
const songRoutes = require('./src/songs/routes');

const AlbumsHandler = require('./src/albums/handler');
const SongsHandler = require('./src/songs/handler');

const albumsValidator = require('./src/albums/validator');
const songsValidator = require('./src/songs/validator');

const ClientError = require('./src/exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const albumsHandler = new AlbumsHandler(albumsService, albumsValidator);
  const songsHandler = new SongsHandler(songsService, songsValidator);

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route(albumRoutes(albumsHandler));
  server.route(songRoutes(songsHandler));

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response.isBoom) {
        const newResponse = h.response({
          status: 'fail',
          message: response.output.payload.message || response.message,
        });
        newResponse.code(response.output.statusCode);
        return newResponse;
      }

      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });


  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

init();