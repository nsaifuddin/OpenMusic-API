const Joi = require('joi');

const ImageContentTypeSchema = Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp');

module.exports = { ImageContentTypeSchema };