const InvariantError = require('../exceptions/InvariantError');

const validateAlbumPayload = (payload) => {
  const { name, year } = payload;

  if (name === undefined || typeof name !== 'string' || name.trim() === '') {
    throw new InvariantError('Gagal memproses permintaan. Name harus berupa string dan wajib diisi');
  }

  if (year === undefined || typeof year !== 'number') {
    throw new InvariantError('Gagal memproses permintaan. Year harus berupa number dan wajib diisi');
  }
};

module.exports = { validateAlbumPayload };