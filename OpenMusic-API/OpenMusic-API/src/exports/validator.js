const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

const ExportsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;