const { nanoid } = require('nanoid');
const pool = require('../utils/db');
const InvariantError = require('../exceptions/InvariantError');

class CollaborationsService {
  constructor(usersService) {
    this._pool = pool;
    this._usersService = usersService;
  }

  async addCollaboration(playlistId, userId) {

    await this._usersService.getUserById(userId); 

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus. Kolaborasi tidak ditemukan.');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi. Bukan kolaborator.');
    }
  }
}

module.exports = CollaborationsService;