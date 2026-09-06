const nodemailer = require('nodemailer');
const pool = require('./utils/db'); 

class MailSender {
  constructor() {
    this._pool = pool;

    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(targetEmail, playlistId) {
    const playlistQuery = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    
    if (!playlistResult.rowCount) {
      throw new Error(`Playlist dengan ID ${playlistId} tidak ditemukan.`);
    }

    const playlist = playlistResult.rows[0];

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s
             LEFT JOIN playlist_songs ps ON ps.song_id = s.id
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);
    playlist.songs = songsResult.rows;

    const result = { playlist };

    const message = {
      from: 'OpenMusic Apps',
      to: targetEmail,
      subject: 'Ekspor Lagu Playlist',
      text: 'Terlampir hasil ekspor lagu dari playlist Anda',
      attachments: [
        {
          filename: 'playlist.json',
          content: JSON.stringify(result, null, 2),
          contentType: 'application/json',
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;