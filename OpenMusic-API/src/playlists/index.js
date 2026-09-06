const PlaylistsHandler = require('./handler');
const routes = require('./routes');
const PlaylistsService = require('../service/PlaylistsService');
const SongsService = require('../service/SongsService');
const CollaborationsService = require('../service/CollaborationsService');
const UsersService = require('../service/UsersService'); 

const {
  validatePlaylistPayload,
  validatePostSongToPlaylistPayload,
} = require('./validator');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server) => {
    const songsService = new SongsService();
    const usersService = new UsersService();
    const collaborationsService = new CollaborationsService(usersService);
    const playlistsService = new PlaylistsService(songsService, collaborationsService); 
    const playlistsValidator = {
      validatePlaylistPayload,
      validatePostSongToPlaylistPayload,
    };
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistsValidator,
    );
    server.route(routes(playlistsHandler));
  },
};