const InvariantError = require('../../exceptions/InvariantError');
const { ImageContentTypeSchema } = require('./schema');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageContentTypeSchema.validate(headers['content-type']);

    if (validationResult.error) {
      throw new InvariantError('Gagal mengunggah gambar karena tipe file tidak didukung');
    }
  },
};

module.exports = UploadsValidator;