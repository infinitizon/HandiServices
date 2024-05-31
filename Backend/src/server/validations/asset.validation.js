const Joi = require('joi').extend(require('@joi/date'));

const createAsset = {
   body: Joi.object().keys({
      pId: Joi.string().guid({ version: 'uuidv4' }).optional().messages({
         'string.guid': `Parent ID (pId) must be a valid GUID`,
      }),
      type: Joi.alternatives().conditional('pId', {
         not: Joi.exist(),
         then: Joi.string().valid(...['category',]).required().messages({
            'any.only': `Product Type must be one of {{#valids}}`,
         }),
         otherwise: Joi.string().valid(...['sub_category',]).required().messages({
            'any.only': `Product Type must be one of {{#valids}} if pId is present`,
         }),
      }),
      title: Joi.string().required().messages({
         'string.empty': `Product title cannot be an empty field`,
         'any.required': `Product title is a required field`,
      }),
      description: Joi.string().required().messages({
         'string.empty': `Description cannot be an empty field`,
         'any.required': `Description is a required field`,
      }),
      price: Joi.number().positive().optional().messages({
         'number.base': 'Price has to be a number',
         'number.positive': 'Price must be a positive number',
         'integer.empty': `Price cannot be an empty field`,
         'any.required': `Price is a required field`,
      }),
   }).unknown(true),
};
const searchProductsWtTenantAndPrice = {
   query: Joi.object().keys({
      q: Joi.string().required().messages({
         'string.empty': `Search term cannot be an empty field`,
         'any.required': `Search term is a required field`,
      }),
   }).unknown(true),
};

const updateAsset = {
   body: Joi.object().keys({
      pId: Joi.alternatives().conditional('pId', {
         is: Joi.any().valid(null, ""),
         then: Joi.optional().allow(null, ""),
         otherwise: Joi.string().guid({ version: 'uuidv4' }).optional().messages({
            'string.guid': `Parent ID (pId) must be a valid GUID`,
         }),
      }),
      type: Joi.alternatives().conditional('pId', {
         not: Joi.exist(),
         then: Joi.string().valid(...['category',]).required().messages({
            'any.only': `Product Type must be one of {{#valids}} if pId is absent`,
         }),
         otherwise: Joi.alternatives().conditional('pId', {
            is: Joi.any().valid(null, ""),
            then: Joi.string().valid(...['category',]).required().messages({
               'any.only': `Product Type must be one of {{#valids}} if pId is present or null`,
            }),
            otherwise: Joi.string().valid(...['sub_category',]).required().messages({
               'any.only': `Product Type must be one of {{#valids}} if pId is present`,
            }),
         }),
      }),
      title: Joi.string().optional().messages({
         'string.empty': `Product title cannot be an empty field`,
         'any.required': `Product title is a required field`,
      }),
      description: Joi.string().optional().messages({
         'string.empty': `Description cannot be an empty field`,
         'any.required': `Description is a required field`,
      }),
      price: Joi.number().positive().optional().allow(null, "").messages({
         'number.base': 'Price has to be a number',
         'number.positive': 'Price must be a positive number',
         'integer.empty': `Price cannot be an empty field`,
         'any.required': `Price is a required field`,
      }),
   }).unknown(true),
};

const addAssetBank = {
   body: Joi.object().keys({
      accountNumber: Joi.string().required().messages({
         'string.empty': `Account Number cannot be an empty field`,
         'any.required': `Account Number is a required field`,
      }),
      nameOnAccount: Joi.string().required().messages({
         'string.empty': `Name On Account cannot be an empty field`,
         'any.required': `Name On Account is a required field`,
      }),
      bank: Joi.object({
         code: Joi.string().required().messages({
            'string.empty': `Bank code cannot be an empty field in the bank object`,
            'any.required': `Bank code is a required field in the bank object`,
         }),
         name: Joi.string().required().messages({
            'string.empty': `Bank name cannot be an empty field in the bank object`,
            'any.required': `Bank name is a required field in the bank object`,
         }),
      }).options({ allowUnknown: true }),
      gateways: Joi.array().optional().items(Joi.object({ 
         gateway: Joi.string().required().messages({
            'string.empty': `Gateway cannot be an empty field`,
            'any.required': `Gateway is a required field`,
         }),
         type: Joi.string().required().valid(...['card','bank',]).messages({
            'string.empty': `Gateway Type in gateways array cannot be an empty field`,
            'any.required': `Gateway Type in gateways array is a required field`,
            'any.only': `Gateway Type in gateways array must be one of {{#valids}}`,
         }),
      })),
   }).unknown(true),
};

const addAssetBankGateways = {
   body: Joi.object().keys({
      gateways: Joi.array().optional().items(Joi.object({ 
         businessSecret: Joi.string().allow(null).allow('').empty('').messages({
            'string.base': 'Business Secret must be a string',
         }),
         description: Joi.string().allow(null).allow('').empty('').messages({
            'string.base': 'Description must be a string',
         }),
         gateway: Joi.object({
            name: Joi.string().required().messages({
               'string.empty': `Gateway cannot be an empty field`,
               'any.required': `Gateway is a required field`,
            }),
            type: Joi.string().required().valid(...['card','bank',]).messages({
               'string.empty': `Gateway Type in gateways array cannot be an empty field`,
               'any.required': `Gateway Type in gateways array is a required field`,
               'any.only': `Gateway Type in gateways array must be one of {{#valids}}`,
            }),
         }).options({ allowUnknown: true }),
      })),
   }).unknown(true),
};
const getTenantsInSubCategoryByGeo = {
   query: Joi.object().keys({
      lat: Joi.number().required().messages({
         'number.base': 'Latitude has to be a number',
         'integer.empty': `Latitude cannot be an empty field`,
         'any.required': `Latitude is a required field`,
      }),
      lng: Joi.number().required().messages({
         'number.base': 'Latitude has to be a number',
         'integer.empty': `Latitude cannot be an empty field`,
         'any.required': `Latitude is a required field`,
      }),
   }).unknown(true),
};
module.exports = {
    createAsset,
    updateAsset,
    addAssetBank,
    addAssetBankGateways,
    getTenantsInSubCategoryByGeo,
    searchProductsWtTenantAndPrice
};
