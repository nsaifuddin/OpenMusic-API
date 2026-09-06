const InvariantError = require('../exceptions/InvariantError');

const validateSongPayload = (payload) => {
  const { title, year, genre, performer, duration, albumId } = payload;

  if (title === undefined || typeof title !== 'string' || title.trim() === '') {
    throw new InvariantError('Gagal memproses permintaan. Title harus berupa string dan wajib diisi');
  }

  if (year === undefined || typeof year !== 'number') {
    throw new InvariantError('Gagal memproses permintaan. Year harus berupa number dan wajib diisi');
  }

  if (genre === undefined || typeof genre !== 'string' || genre.trim() === '') {
    throw new InvariantError('Gagal memproses permintaan. Genre harus berupa string dan wajib diisi');
  }

  if (performer === undefined || typeof performer !== 'string' || performer.trim() === '') {
    throw new InvariantError('Gagal memproses permintaan. Performer harus berupa string dan wajib diisi');
  }

  if (duration !== undefined && typeof duration !== 'number') {
    throw new InvariantError('Gagal memproses permintaan. Duration harus berupa number');
  }

  if (albumId !== undefined && (typeof albumId !== 'string' || albumId.trim() === '')) {
    throw new InvariantError('Gagal memproses permintaan. AlbumId harus berupa string dan tidak boleh kosong jika diisi');
  }
};

module.exports = { validateSongPayload };