const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const validateCollaborationPayload = (payload) => {
  const validationResult = CollaborationPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

module.exports = { validateCollaborationPayload };