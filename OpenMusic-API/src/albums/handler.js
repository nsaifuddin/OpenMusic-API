const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async addAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);
  }

  async getAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songsInAlbum = await this._service.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs: songsInAlbum,
        },
      },
    };
  }

  async editAlbumByIdHandler(request, _h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;