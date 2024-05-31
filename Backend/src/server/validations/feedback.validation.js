const Joi = require('joi').extend(require('@joi/date'));

class FeedbackValidator {
  static get createReport() { 
     return {
      body: Joi.object().keys({
        issue: Joi.string().optional().messages({
          'string.empty': `issue cannot be an empty field`,
        }),
        description: Joi.string().required().messages({
          'string.empty': `Description cannot be an empty field`,
          'any.required': `Description is a required field`,
        }),
      }).unknown(true),
    }; 
  }
}

module.exports = FeedbackValidator;

// const createReport = {
//   body: Joi.object().keys({
//     issue: Joi.string().optional().messages({
//       'string.empty': `issue cannot be an empty field`,
//     }),
//     description: Joi.string().required().messages({
//       'string.empty': `Description cannot be an empty field`,
//       'any.required': `Description is a required field`,
//     }),
//   }).unknown(true),
// };
// module.exports = {
//     createReport,
// };