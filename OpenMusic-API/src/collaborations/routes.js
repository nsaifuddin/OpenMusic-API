const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.addCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;