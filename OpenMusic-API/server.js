require('dotenv').config();
if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
  console.error('KRITIS: ACCESS_TOKEN_KEY dan/atau REFRESH_TOKEN_KEY tidak ditemukan di file .env');
  console.error('Pastikan variabel tersebut sudah terisi dengan benar.');
  process.exit(1);
}
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const albumsPlugin = require('./src/albums');
const songsPlugin = require('./src/songs');
const usersPlugin = require('./src/users');
const authenticationsPlugin = require('./src/authentications');
const playlistsPlugin = require('./src/playlists');
const collaborationsPlugin = require('./src/collaborations'); 

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

  await server.register(Jwt);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 1800,
    },
    validate: (artifacts, _request, _h) => {
      return {
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.userId,
        },
      };
    },
  });

  await server.register([
    { plugin: albumsPlugin },
    { plugin: songsPlugin },
    { plugin: usersPlugin },
    { plugin: authenticationsPlugin },
    { plugin: playlistsPlugin },
    { plugin: collaborationsPlugin }
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
          message: response.output.payload.message || response.message,
        });
        newResponse.code(response.output.statusCode);
        return newResponse;
      }

      console.error('Unhandled error, defaulting to 500:', response);
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