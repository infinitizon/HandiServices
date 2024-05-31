const Joi = require('joi').extend(require('@joi/date'));

const createXter = {
   body: Joi.object().keys({
      name: Joi.string().required().messages({
         'string.empty': `Characteristic name cannot be empty`,
         'any.required': `Characteristic name is a required field`,
      }),
      type: Joi.string().required().messages({
         'string.empty': `Characteristic type cannot be an empty field`,
         'any.required': `Characteristic type is a required field`,
      }),
      minPrice: Joi.number().min(0).required().messages({
         'number.base': 'Minimum Price has to be a number',
         'number.positive': 'Minimum Price must be a positive number',
         'number.min': 'Minimum Price must 0 or greater',
         'integer.empty': `Minimum Price cannot be an empty field`,
         'any.required': `Minimum Price is a required field`,
      }),
      maxPrice: Joi.number().min(Joi.ref('minPrice')).positive().optional().messages({
         'number.base': 'Maximum Price has to be a number',
         'number.positive': 'Maximum Price must be a positive number',
         'number.min': 'Maximum Price must greater than or equal to minimum price',
         'integer.empty': `Maximum Price cannot be an empty field`,
         'any.required': `Maximum Price is a required field`,
      }),
   }).unknown(true),
};
const updateXter = {
   body: Joi.object().keys({
      name: Joi.string().optional().messages({
         'string.empty': `Characteristic name cannot be empty`,
         'any.required': `Characteristic name is a required field`,
      }),
      type: Joi.string().optional().messages({
         'string.empty': `Characteristic type cannot be an empty field`,
         'any.required': `Characteristic type is a required field`,
      }),
      minPrice: Joi.number().min(0).optional().messages({
         'number.base': 'Minimum Price has to be a number',
         'number.positive': 'Minimum Price must be a positive number',
         'number.min': 'Minimum Price must 0 or greater',
         'integer.empty': `Minimum Price cannot be an empty field`,
         'any.required': `Minimum Price is a required field`,
      }),
      maxPrice: Joi.number().min(Joi.ref('minPrice')).positive().optional().messages({
         'number.base': 'Maximum Price has to be a number',
         'number.positive': 'Maximum Price must be a positive number',
         'number.min': 'Maximum Price must greater than or equal to minimum price',
         'integer.empty': `Maximum Price cannot be an empty field`,
         'any.required': `Maximum Price is a required field`,
      }),
   }).unknown(true),
};
const createProductPrice = {
   body: Joi.object().keys({
      prices: Joi.array().unique('characteristic').items(Joi.object({ 
         characteristic: Joi.string().guid({ version: 'uuidv4' }).required().messages({
            'string.guid': `Type must be a valid GUID`,
            'any.required': `Type is a required`,
         }),
         price: Joi.number().positive().required().messages({
            'number.empty': `Amount cannot be empty`,
            'any.required': `Amount is a required`,
         }),
      })).messages({
         'array.unique': 'Your entries contains a duplicate value at position {{#dupePos}}'
      }),
   }).unknown(true),
};

module.exports = {
   createXter,
   updateXter,
   createProductPrice,
};
