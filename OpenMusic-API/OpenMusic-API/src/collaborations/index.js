const CollaborationsHandler = require('./handler');
const routes = require('./routes');
const CollaborationsService = require('../service/CollaborationsService');
const PlaylistsService = require('../service/PlaylistsService');
const UsersService = require('../service/UsersService');
const SongsService = require('../service/SongsService');
const { validateCollaborationPayload } = require('./validator');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server) => {
    const usersService = new UsersService();
    const collaborationsService = new CollaborationsService(usersService);
    const songsService = new SongsService();
    const playlistsService = new PlaylistsService(songsService, collaborationsService);

    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      { validateCollaborationPayload },
    );
    server.route(routes(collaborationsHandler));
  },
};