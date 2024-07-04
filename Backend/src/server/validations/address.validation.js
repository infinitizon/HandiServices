const Joi = require('joi').extend(require('@joi/date'));

const createAddress = {
  body: Joi.object().keys({
    firstName: Joi.string().required().messages({
      'string.empty': `First Name cannot be an empty field`,
      'any.required': `First Name is a required field`,
    }),
    lastName: Joi.string().required().messages({
      'string.empty': `Last Name cannot be an empty field`,
      'any.required': `Last number is a required field`,
    }),
    houseNo: Joi.string().required().messages({
      'string.empty': `House number cannot be an empty field`,
      'any.required': `House number is a required field`,
    }),
    address1: Joi.string().max(100).required().messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    address2: Joi.string().max(100).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    city: Joi.string().required().max(100).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    country: Joi.string().required().max(2).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    state: Joi.string().required().max(2).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    lng: Joi.number().messages({
      'integer.empty': `Longitude cannot be an empty field`,
      'any.required': `Longitude is a required field`,
    }),
    lat: Joi.number().messages({
      'integer.empty': `Latitude cannot be an empty field`,
      'any.required': `Latitude is a required field`,
    }),
  }).unknown(true),
};

const updateAddress = {
  body: Joi.object().keys({
    firstName: Joi.string().optional().messages({
      'string.empty': `First Name cannot be an empty field`,
      'any.required': `First Name is a required field`,
    }),
    lastName: Joi.string().optional().messages({
      'string.empty': `Last Name cannot be an empty field`,
      'any.required': `Last number is a required field`,
    }),
    houseNo: Joi.string().optional().messages({
      'string.empty': `House number cannot be an empty field`,
      'any.required': `House number is a required field`,
    }),
    address1: Joi.string().optional().max(100).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    address2: Joi.string().optional().max(100).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    city: Joi.string().optional().max(100).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    country: Joi.string().optional().max(2).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    state: Joi.string().optional().max(2).messages({
      'string.empty': `Address Line 1 cannot be an empty field`,
      'any.required': `Address Line 1 is a required field`,
    }),
    lng: Joi.number().optional().messages({
      'integer.empty': `Longitude cannot be an empty field`,
      'any.required': `Longitude is a required field`,
    }),
    lat: Joi.number().optional().messages({
      'integer.empty': `Latitude cannot be an empty field`,
      'any.required': `Latitude is a required field`,
    }),
  }).unknown(true),
};

module.exports = {
  createAddress,
  updateAddress,
};
