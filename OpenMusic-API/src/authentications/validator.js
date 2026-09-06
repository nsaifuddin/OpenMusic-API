const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const validatePostAuthenticationPayload = (payload) => {
  const validationResult = PostAuthenticationPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

const validatePutAuthenticationPayload = (payload) => {
  const validationResult = PutAuthenticationPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

const validateDeleteAuthenticationPayload = (payload) => {
  const validationResult = DeleteAuthenticationPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

module.exports = {
  validatePostAuthenticationPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload,
};