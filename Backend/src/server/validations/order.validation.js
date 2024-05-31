const Joi = require('joi').extend(require('@joi/date'));

class OrderValidator {
   static get customerStatus() { 
      return {
         body: Joi.object().keys({
            status: Joi.string().required().valid(...['completed','cancelled',]).messages({
               'string.empty': `Order status cannot be empty`,
               'any.required': `Order status must be specified`,
               'any.only': `Order status must be one of {{#valids}}`,
            }),
         }).unknown(true),
         params: Joi.object().keys({
            orderId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
               'string.guid': `OrderId must be a valid GUID in the request parameter`,
            }),
         })
      }; 
   }

   static get providerStatus() {
      return {
         body: Joi.object().keys({
            status: Joi.string().required().valid(...['inprogress', 'done',]).messages({
               'string.empty': `Order status cannot be empty`,
               'any.required': `Order status must be specified`,
               'any.only': `Order status must be one of {{#valids}}`,
            }),
         }).unknown(true),
      }
   }
}

module.exports = OrderValidator;