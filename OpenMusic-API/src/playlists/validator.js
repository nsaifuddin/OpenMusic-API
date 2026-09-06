const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const validatePlaylistPayload = (payload) => {
  const validationResult = PlaylistPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

const validatePostSongToPlaylistPayload = (payload) => {
  const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

module.exports = {
  validatePlaylistPayload,
  validatePostSongToPlaylistPayload,
};