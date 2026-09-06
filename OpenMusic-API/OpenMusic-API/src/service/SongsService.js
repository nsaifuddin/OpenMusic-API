const { nanoid } = require('nanoid');
const pool = require('../utils/db');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = pool;
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let text = 'SELECT id, title, performer FROM songs';
    const values = [];
    const conditions = [];

    if (title && typeof title === 'string' && title.trim() !== '') {
      values.push(`%${title.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (performer && typeof performer === 'string' && performer.trim() !== '') {
      values.push(`%${performer.trim()}%`);
      conditions.push(`performer ILIKE $${values.length}`);
    }

    if (conditions.length > 0) {
      text += ` WHERE ${conditions.join(' AND ')}`;
    }

    const query = { text, values };
    const result = await this._pool.query(query);
    return result.rows;
  }


  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, genre, performer, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    const song = result.rows[0];
    return {
      id: song.id,
      title: song.title,
      year: song.year,
      genre: song.genre,
      performer: song.performer,
      duration: song.duration,
      albumId: song.album_id,
    };
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;