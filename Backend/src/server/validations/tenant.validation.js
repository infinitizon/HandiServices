const Joi = require('joi').extend(require('@joi/date'));

const createTenant = {
   body: Joi.object().keys({  
      header: Joi.object({
         fileType: Joi.string().required().valid(...['agent',]).messages({
            'string.empty': `You need to give a value to file type`,
            'any.required': `File type must be specified`,
            'any.only': `File type must be one of {{#valids}}`,
         }),
      }).options({ allowUnknown: true }),
      details: Joi.array().items(Joi.object({
         name: Joi.string().required().messages({
            'string.empty': `Last Name cannot be an empty field`,
            'any.required': `Last Name is a required field`,
         }),
         email: Joi.string().optional().messages({
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`,
         }),
         phone: Joi.string().optional().messages({
            'string.empty': `Place Of Birth cannot be an empty field`,
            'any.required': `Place Of Birth is a required field`,
         }),
         Addresses: Joi.array().optional().items(Joi.object({ 
            address1: Joi.string().messages({
               'string.empty': `Address 1 cannot be an empty field`,
               'any.required': `Address 1 is a required field`,
            }),
            city: Joi.string().messages({
               'string.empty': `City cannot be an empty field`,
               'any.required': `City is required`,
            }),
            country: Joi.string().messages({
               'string.empty': `Country cannot be an empty field`,
               'any.required': `Country is required`,
            }),
         })).options({ allowUnknown: true }),
      })).options({ allowUnknown: true }),
   }),
};

const updateTenant = {
   params: Joi.object().keys({ 
      tenantId: Joi.string().guid({version: 'uuidv4'}).required().messages({
         'guid.empty': `Tenant ID cannot be empty`,
         'any.required': `Tenant ID is required`,
      }),
   }),
   body: Joi.object().keys({  
      header: Joi.object({
         fileType: Joi.string().required().valid(...['tenant',]).messages({
            'string.empty': `You need to give a value to file type`,
            'any.required': `File type must be specified`,
            'any.only': `File type must be one of {{#valids}}`,
         }),
      }).options({ allowUnknown: true }),
      details: Joi.array().items(Joi.object({
         name: Joi.string().optional().messages({
            'string.empty': `Last Name cannot be an empty field`,
            'any.required': `Last Name is a required field`,
         }),
         email: Joi.string().optional().messages({
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`,
         }),
         phone: Joi.string().optional().messages({
            'string.empty': `Place Of Birth cannot be an empty field`,
            'any.required': `Place Of Birth is a required field`,
         }),
         Addresses: Joi.array().optional().items(Joi.object({ 
            address1: Joi.string().messages({
               'string.empty': `Address 1 cannot be an empty field`,
               'any.required': `Address 1 is a required field`,
            }),
            city: Joi.string().messages({
               'string.empty': `City cannot be an empty field`,
               'any.required': `City is required`,
            }),
            country: Joi.string().messages({
               'string.empty': `Country cannot be an empty field`,
               'any.required': `Country is required`,
            }),
         })).options({ allowUnknown: true }),
      })).options({ allowUnknown: true }),
   }),
};
module.exports = {
   createTenant,
   updateTenant,
};
