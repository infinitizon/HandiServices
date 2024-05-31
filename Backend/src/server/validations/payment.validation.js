const Joi = require('joi');

class PaymentValidation {

  static initiate = {
    body: Joi.object().keys({
      amount: Joi.number().positive().required().messages({
        'number.empty': `Amount cannot be empty`,
        'any.required': `Amount is a required`,
      }),
      currency: Joi.string().required().messages({
        'string.base': `Currency should be of type 'text'`,
        'string.empty': `Currency cannot be empty`,
        'any.required': `Currency is required`,
      }),
      redirectUrl: Joi.string().required().messages({
        'string.base': `Redirect URL should be of type 'text'`,
        'string.empty': `Redirect URL cannot be empty`,
        'any.required': `Redirect URL is required`,
      }),
      gateway: Joi.string().required().messages({
        'string.empty': `Payment gateway cannot be empty`,
        'any.required': `Payment gateway is required`,
      }),
      callbackParams: Joi.any().required().messages({
        'any.required': `Callback Parameters are required`,
      }),
      details: Joi.array().optional().items(Joi.object({ 
        // Object schema
        amount: Joi.number().positive().required().messages({
          'number.empty': `Amount cannot be empty`,
          'any.required': `Amount is a required`,
        }),
        userId: Joi.string().guid({version: 'uuidv4'}).required().messages({
          'guid.empty': `User ID cannot be empty`,
          'any.required': `User ID is required`,
        }),
      }))
    }).unknown(),
  };
  static call_back = {
    body: Joi.object().keys({
      gateway: Joi.string().required().messages({
        'string.empty': `Payment gateway cannot be empty`,
        'any.required': `Payment gateway is required`,
      }),
    }).unknown(),
  };
  static listGateways = {
    query: Joi.object().keys({
      id: Joi.any().required().messages({
        'string.empty': `id of module is missing in the query string`,
        'any.required': `id of module is missing in the query string`,
      }),
    }).unknown(),
  };
}


module.exports = PaymentValidation
