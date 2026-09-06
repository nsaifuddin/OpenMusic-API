const Joi = require('joi');
const InvariantError = require('../exceptions/InvariantError');

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

const validateUserPayload = (payload) => {
  const validationResult = UserPayloadSchema.validate(payload);
  if (validationResult.error) {
    throw new InvariantError(validationResult.error.message);
  }
};

module.exports = { validateUserPayload };