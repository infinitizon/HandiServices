const Joi = require('joi');

class ErrorValidation {
    static parameters = {
        body: Joi.object().keys({
            line: Joi.number().required().messages({
                'number.base': 'Line number must be a number',
                // 'number.min': `BVN should have a minimum length of {#limit}`,
                'any.required': `Line number is required`,
            }),
            file: Joi.string().required().messages({
                'string.empty': `File Name cannot be empty`,
                'any.required': `File Name is required`,
            }),
        }).unknown(),
    };
}

module.exports = ErrorValidation;
