require('dotenv').config();
if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
  console.error('KRITIS: ACCESS_TOKEN_KEY dan/atau REFRESH_TOKEN_KEY tidak ditemukan di file .env');
  console.error('Pastikan variabel tersebut sudah terisi dengan benar.');
  process.exit(1);
}
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const albumsPlugin = require('./src/albums');
const songsPlugin = require('./src/songs');
const usersPlugin = require('./src/users');
const authenticationsPlugin = require('./src/authentications');
const playlistsPlugin = require('./src/playlists');
const collaborationsPlugin = require('./src/collaborations');
const exportsPlugin = require('./src/exports');
const CollaborationsService = require('./src/service/CollaborationsService');
const UsersService = require('./src/service/UsersService');
const SongsService = require('./src/service/SongsService');
const PlaylistsService = require('./src/service/PlaylistsService');

const ClientError = require('./src/exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    { plugin: Jwt },
    { plugin: Inert },
  ]);

  server.route({
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'src/service/storage'),
      },
    },
  });

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 1800,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.userId,
      },
    }),
  });

  const collaborationsService = new CollaborationsService(new UsersService());
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(songsService, collaborationsService);

  await server.register([
    { plugin: albumsPlugin },
    { plugin: songsPlugin },
    { plugin: usersPlugin },
    { plugin: authenticationsPlugin },
    { plugin: playlistsPlugin },
    { plugin: collaborationsPlugin },
    {
      plugin: exportsPlugin,
      options: {
        playlistsService,
      },
    },
  ]);

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
          message: response.message,
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