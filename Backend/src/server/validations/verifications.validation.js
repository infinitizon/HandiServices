const Joi = require('joi');

const verifyBVN = {
  body: Joi.object().keys({
    bvn: Joi.string().required().messages({
      'string.base': `BVN should be a type of 'text'`,
      'string.empty': `BVN cannot be an empty field`,
      'any.required': `BVN is a required field`,
    }),
    dob: Joi.string().required().messages({
      'string.empty': `Date of Birth cannot be an empty field`,
      'any.required': `Date of Birth is a required field`,
    }),
  }),
};
const verifyCSCS = {
  body: Joi.object().keys({
    bvn: Joi.string().required().messages({
      'string.base': `BVN should be a type of 'text'`,
      'string.empty': `BVN cannot be an empty field`,
      'any.required': `BVN is a required field`,
    }),
    cscsNo: Joi.string().required().messages({
      'string.base': `CSCS No should be a type of 'text'`,
      'string.empty': `CSCS No cannot be an empty field`,
      'any.required': `CSCS No is a required field`,
    }),
  }),
};

const saveplan_charge_types = {
  body: Joi.object().keys({
    name: Joi.string().required().messages({
      'string.empty': `Name cannot be an empty field`,
      'any.required': `Name is a required field`,
    }),
    gl_entity_id: Joi.string().required().messages({
      'string.empty': `GL entity cannot be an empty field`,
      'any.required': `GL entity is a required field`,
    }),
    start_duration: Joi.number().required().messages({
      'number.empty': `Start duration cannot be an empty field`,
      'any.required': `Start duration is a required field`,
    }),
    end_duration: Joi.number().required().messages({
      'number.empty': `End duration cannot be an empty field`,
      'any.required': `End duration is a required field`,
    }),
    rate: Joi.number().required().messages({
      'number.empty': `Rate cannot be an empty field`,
      'any.required': `Rate is a required field`,
    }),
    frequency: Joi.string()
      .required()
      .valid(
        ...[
          'once',
          'daily',
          'weekly',
          'forthnight',
          'monthly',
          'bimonthly',
          'quarterly',
          'semiannual',
          'yearly',
          'beot',
          'eot',
        ]
      ), // How often is this charged. E.g Once, daily, weekly, beot="Before End of term", eot="End of term"
    charged_on: Joi.string()
      .required()
      .valid(...['principal', 'interest', 'both']), // E.g. principal, interest
  }).unknown(true),
};

const findAllSavePlans = {
  query: Joi.object().keys({
    title: Joi.string().optional().allow(null).allow(''),
    slug: Joi.string().optional().allow(null).allow(''),
    icon: Joi.string().optional().allow(null).allow(''),
    type: Joi.string().optional().allow(null).allow(''),
    calculator_id: Joi.string().optional().allow(null).allow(''),
    currency: Joi.string().optional().allow(null).allow(''),
    description: Joi.string().optional().allow(null).allow(''),
    interest_rate: Joi.number().optional().allow(null).allow(''),
    min_duration: Joi.number().optional().allow(null).allow(''),
    max_duration: Joi.number().optional().allow(null).allow(''),
    min_amount: Joi.number().optional().allow(null).allow(''),
    max_amount: Joi.number().optional().allow(null).allow(''),
    status: Joi.string().optional().allow(null).allow(''),
    target: Joi.number().optional().allow(null).allow(''),
    saving_code: Joi.string().optional().allow(null).allow(''),
    page: Joi.optional().allow(null).allow(''),
    perPage: Joi.optional().allow(null).allow(''),
  }),
};

const create_account = {
  body: Joi.object().keys({
    email: Joi.string().optional().allow(null),
    // bank_name: Joi.string().required().messages({
    //   'string.empty': `Bank Name cannot be an empty field`,
    //   'any.required': `Bank Name is a required field`,
    // }),
    name_on_account: Joi.string().required().messages({
      'string.empty': `Account Name cannot be an empty field`,
      'any.required': `Account Name is a required field`,
    }),
    account_number: Joi.string().required().messages({
      'string.empty': `Interest Rate cannot be an empty field`,
      'any.required': `Interest Rate is a required field`,
    }),
    // business_name: Joi.string().required().messages({
    //   'string.empty': `Business Name cannot be an empty field`,
    //   'any.required': `Business Name is a required field`,
    // }),
    // bank_code: Joi.string().required().messages({
    //   'string.empty': `Bank Code cannot be an empty field`,
    //   'any.required': `Bank Code is a required field`,
    // }),
    transaction_type: Joi.string().optional().allow(null),
    acct_type: Joi.string().optional(),
    split: Joi.number().optional(),
    gl_entity_id: Joi.string().required().messages({
      'string.empty': `GL enitity ID cannot be an empty field`,
      'any.required': `GL entity ID is a required field`,
    }),
  }).unknown(true),
};

module.exports = {
  verifyBVN,
};
