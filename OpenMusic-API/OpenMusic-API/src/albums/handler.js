const autoBind = require('auto-bind');
const InvariantError = require('../exceptions/InvariantError'); // Impor yang hilang

class AlbumsHandler {
  constructor(service, storageService, validator, uploadsValidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadsValidator = uploadsValidator;
    autoBind(this);
  }

  async addAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.addAlbum({ name, year });
    return h.response({
      status: 'success',
      data: { albumId },
    }).code(201);
  }

  async getAlbumByIdHandler(request, _h) {
    const { id } = request.params;
    const albumData = await this._service.getAlbumById(id);
    const songsData = await this._service.getSongsByAlbumId(id);
    const album = {
      id: albumData.id,
      name: albumData.name,
      year: albumData.year,
      coverUrl: albumData.cover_url,
      songs: songsData,
    };
    return {
      status: 'success',
      data: {
        album,
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

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;

    if (!cover) {
      throw new InvariantError('Tidak ada berkas yang diunggah');
    }

    console.log('--- DEBUG: HEADERS DARI FILE YANG DIUNGGAH ---');
    console.log(cover.hapi.headers);
    console.log('-------------------------------------------');

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.addAlbumCover(albumId, fileUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.addLikeToAlbum(userId, albumId);
    return h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    }).code(201);
  }

  async deleteAlbumLikeHandler(request, _h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this._service.deleteLikeFromAlbum(userId, albumId);
    return {
      status: 'success',
      message: 'Berhasil batal menyukai album',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { count: likes, source } = await this._service.getLikesCountByAlbumId(albumId);
    const response = h.response({
      status: 'success',
      data: { likes },
    });
    if (source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;