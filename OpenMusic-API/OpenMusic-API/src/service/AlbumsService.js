const { nanoid } = require('nanoid');
const pool = require('../utils/db');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = pool;
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);
      return JSON.parse(result);

    } catch {
      const query = {
        text: 'SELECT id, name, year, cover_url FROM albums WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      await this._cacheService.set(`album:${id}`, JSON.stringify(result.rows[0]));
      return result.rows[0];
    }
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
    await this._cacheService.delete(`album:${id}`);
  }

  async addAlbumCover(albumId, fileUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [fileUrl, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui sampul. Album tidak ditemukan.');
    }
    await this._cacheService.delete(`album:${albumId}`);
  }

  async addLikeToAlbum(userId, albumId) {
    await this.getAlbumById(albumId);
    const checkQuery = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rowCount > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };
    await this._pool.query(query);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async deleteLikeFromAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal batal menyukai. Anda belum menyukai album ini.');
    }
    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getLikesCountByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return { count: JSON.parse(result), source: 'cache' };
    } catch {
      await this.getAlbumById(albumId);
      const query = {
        text: 'SELECT COUNT(id) as likes_count FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likesCount = parseInt(result.rows[0].likes_count, 10);
      await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(likesCount));
      return { count: likesCount, source: 'database' };
    }
  }
}

module.exports = AlbumsService;