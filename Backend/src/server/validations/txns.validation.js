const Joi = require('joi');

const approveRejectTxn = {
   body: Joi.object().keys({  
      status: Joi.string().required().valid(...['approved','rejected',]).messages({
         'string.empty': `You need to specify approval type`,
         'any.required': `Status must be specified`,
         'any.only': `Status must be one of {{#valids}}`,
      }),
   }).options({ allowUnknown: true }).when(Joi.object({ status: Joi.valid('rejected') }).unknown(), {
      then: Joi.object({ 
         message: Joi.required().messages({
            'string.empty': `You need to specify message if status='rejected'`,
            'any.required': `Message is a required field if status='rejected'`,
         }),
      })
   })
};

module.exports = {
   approveRejectTxn,
};
