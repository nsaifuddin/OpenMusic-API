const { nanoid } = require('nanoid');
const pool = require('../utils/db');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService, collaborationsService) {
    this._pool = pool;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT DISTINCT p.id, p.name, u.username
             FROM playlists p
             LEFT JOIN users u ON u.id = p.owner
             LEFT JOIN collaborations c ON c.playlist_id = p.id
             WHERE p.owner = $1 OR c.user_id = $1`,
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT p.id, p.name, u.username FROM playlists p
             LEFT JOIN users u ON u.id = p.owner
             WHERE p.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async deletePlaylistById(id, owner) {
    await this.verifyPlaylistOwner(id, owner);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this._songsService.getSongById(songId);

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistDetails = await this.getPlaylistById(playlistId);

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer FROM songs s
             INNER JOIN playlist_songs ps ON s.id = ps.song_id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);

    return {
      ...playlistDetails,
      songs: songsResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Lagu atau playlist tidak ditemukan dalam relasi');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini sebagai pemilik');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
      }
    }
  }
  
  async addPlaylistActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities(id, playlist_id, song_id, user_id, action) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan aktivitas playlist');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time
             FROM playlist_song_activities psa
             JOIN users u ON psa.user_id = u.id
             JOIN songs s ON psa.song_id = s.id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time ASC`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;