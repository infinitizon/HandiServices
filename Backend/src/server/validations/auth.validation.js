const Joi = require('joi').extend(require('@joi/date'));

const signup = {
   body: Joi.object().keys({
      firstName: Joi.string().required().messages({
        'string.empty': `First Name cannot be an empty field`,
        'any.required': `First Name is a required field`,
      }),
      lastName: Joi.string().required().messages({
        'string.empty': `Last Name cannot be an empty field`,
        'any.required': `Last Name is a required field`,
      }),
      email: Joi.string()
      .pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      .required().messages({
        'string.pattern.base': `{:[.]} does not match a valid email pattern`,
        'string.empty': `Email cannot be an empty field`,
        'any.required': `Email is a required field`,
      }),
      phone: Joi.string().required().messages({
        'string.empty': `Phone cannot be an empty field`,
        'any.required': `Phone is a required field`,
      }),
      password: Joi.string().optional().min(8)
      .pattern(/\d/, { name: 'numbers'}) //At least one digit
      .pattern(/[a-z]/, { name: 'oneLowerCase'}) //At least one digit
      .pattern(/[A-Z]/, { name: 'oneUpperCase'}) //At least one digit
      .pattern(/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, { name: 'specialChar'}) //At least one digit
      .messages({
        'string.pattern.name': `Password must contain at least one digit, one lowercase, one uppercase and one special character`,
        'string.min': `Password must be at least 8 characters`,
        'string.empty': `Password cannot be an empty field`,
        'any.required': `Password is a required field`,
      }),
   }).unknown(true),
};

const completeTntCreatn = {
   body: Joi.object().keys({
      category: Joi.string().guid({ version: 'uuidv4' }).required().messages({
         'string.guid': `Category must be a valid GUID`,
         'any.required': `Category is a required field `,
      }),
      userId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
         'string.guid': `User ID must be a valid GUID`,
         'any.required': `User ID is a required field `,
      }),
      email: Joi.string().required().messages({
         'string.empty': `Business Email cannot be empty`,
         'any.required': `Business Email is a required field`,
      }),
      name: Joi.string().required().messages({
         'string.empty': `Business Name cannot be empty`,
         'any.required': `Business Name is a required field`,
      }),
      Addresses: Joi.array().required().items(Joi.object({
         address1: Joi.string().required().messages({
            'string.empty': `Could not identify your street from address provided. Please provide a nearest address`,
            'any.required': `Could not identify your street from address provided. Please provide a nearest address`,
         }),
         lng: Joi.number().required().messages({
            'number.base': `Could not identify your coordinates from address provided. Longitude must be number`,
            'string.empty': `Could not identify your coordinates from address provided. Missing Longitude`,
            'any.required': `Could not identify your coordinates from address provided. Missing Longitude`,
         }),
         city: Joi.string().required().messages({
            'string.empty': `Could not identify your city from address provided. Please provide a nearest address`,
            'any.required': `Could not identify your city from address provided. Please provide a nearest address`,
         }),
         lat: Joi.number().required().messages({
            'number.base': `Could not identify your coordinates from address provided. Latitude must be number`,
            'string.empty': `Could not identify your coordinates from address provided. Missing Latitude`,
            'any.required': `Could not identify your coordinates from address provided. Missing Latitude`,
         }),
      })).options({ allowUnknown: true }),
   }).unknown(true),
};
const createUser = {
   body: Joi.object().keys({  
      header: Joi.object({
         userRole: Joi.string().required().messages({
            'string.empty': `User Role cannot be an empty field`,
            'any.required': `User Role is a required field`,
         }),
         fileType: Joi.string().required().valid(...['user',]).messages({
            'string.empty': `You need to give a value to file type`,
            'any.required': `File type must be specified`,
            'any.only': `File type must be one of {{#valids}}`,
         }),
      }).options({ allowUnknown: true }),
      details: Joi.array().when('header.userRole', {
         is: "CUSTOMER",
         then: Joi.array().items(Joi.object({
            bvn: Joi.string().required().messages({
               'string.empty': `BVN cannot be an empty field`,
               'any.required': `BVN is a required field`,
            }),
            firstName: Joi.string().required().messages({
               'string.empty': `First Name cannot be an empty field`,
               'any.required': `First Name is a required field`,
            }),
            lastName: Joi.string().required().messages({
               'string.empty': `Last Name cannot be an empty field`,
               'any.required': `Last Name is a required field`,
            }),
            email: Joi.string().required().messages({
               'string.empty': `Email cannot be an empty field`,
               'any.required': `Email is a required field`,
            }),
            gender: Joi.string().required().valid(...['male','female',]), // Gender can only be male or female"
            dob: Joi.date().format(['YYYY-MM-DD', 'DD-MM-YYYY']).required().messages({
               'date.base': `Date of Birth must a valid date`,
               'date.format': `Date of Birth must be in either YYYY-MM-DD or DD-MM-YYYY format`,
            }),
            phone: Joi.string().required().messages({
               'string.empty': `Phone cannot be an empty field`,
               'any.required': `Phone is a required field`,
            }),
            placeOfBirth: Joi.string().required().messages({
               'string.empty': `Place Of Birth cannot be an empty field`,
               'any.required': `Place Of Birth is a required field`,
            }),
            mothersMaidenName: Joi.string().required().messages({
               'string.empty': `Mother's Maiden Name cannot be an empty field`,
               'any.required': `Mother's Maiden Name is a required field`,
            }),
            Addresses: Joi.array().optional().items(Joi.object({ 
               address1: Joi.string().required().messages({
                  'string.empty': `Address 1 cannot be an empty field`,
                  'any.required': `Address 1 is a required field`,
               }),
               city: Joi.string().required().messages({
                  'string.empty': `City cannot be an empty field`,
                  'any.required': `City is required`,
               }),
               country: Joi.string().required().messages({
                  'string.empty': `Country cannot be an empty field`,
                  'any.required': `Country is required`,
               }),
            })).options({ allowUnknown: true }),
            NextOfKins: Joi.array().optional().items(Joi.object({ 
               relationship: Joi.string().required().messages({
                  'string.empty': `Next Of Kin Relationship cannot be an empty field`,
                  'any.required': `Next Of Kin Relationship is a required field`,
               }),
               name: Joi.string().required().messages({
                  'string.empty': `Next Of Kin Name cannot be an empty field`,
                  'any.required': `Next Of Kin Name is a required field`,
               }),
               phone: Joi.string().required().messages({
                  'string.empty': `Next Of Kin Phone cannot be an empty field`,
                  'any.required': `Next Of Kin Phone is required`,
               }),
               email: Joi.string().optional().messages({
                  'string.empty': `Country cannot be an empty field`,
                  'any.required': `Country is required`,
               }),
            })),
         })),
         otherwise: Joi.array().items(Joi.object({
            firstName: Joi.string().required().messages({
               'string.empty': `First Name cannot be an empty field`,
               'any.required': `First Name is a required field`,
            }),
            lastName: Joi.string().required().messages({
               'string.empty': `Last Name cannot be an empty field`,
               'any.required': `Last Name is a required field`,
            }),
            email: Joi.string().required().messages({
               'string.empty': `Email cannot be an empty field`,
               'any.required': `Email is a required field`,
            }),
            gender: Joi.string().required().valid(...['male','female',]), // Gender can only be male or female"
            dob: Joi.date().format(['YYYY-MM-DD', 'DD-MM-YYYY']).required().messages({
               'date.base': `Date of Birth must a valid date`,
               'date.format': `Date of Birth must be in either YYYY-MM-DD or DD-MM-YYYY format`,
            }),
            phone: Joi.string().required().messages({
               'string.empty': `Phone cannot be an empty field`,
               'any.required': `Phone is a required field`,
            }),
         }))
      }).options({ allowUnknown: true }),
   }),
};
const createAddress = {
   body: Joi.object().keys({  
      // Addresses: Joi.array().required().items(Joi.object({
         address1: Joi.string().required().messages({
            'string.empty': `Could not identify your street from address provided. Please provide a nearest address`,
            'any.required': `Could not identify your street from address provided. Please provide a nearest address`,
         }),
         lng: Joi.number().required().messages({
            'number.base': `Could not identify your coordinates from address provided. Longitude must be number`,
            'string.empty': `Could not identify your coordinates from address provided. Missing Longitude`,
            'any.required': `Could not identify your coordinates from address provided. Missing Longitude`,
         }),
         city: Joi.string().required().messages({
            'string.empty': `Could not identify your city from address provided. Please provide a nearest address`,
            'any.required': `Could not identify your city from address provided. Please provide a nearest address`,
         }),
         lat: Joi.number().required().messages({
            'number.base': `Could not identify your coordinates from address provided. Latitude must be number`,
            'string.empty': `Could not identify your coordinates from address provided. Missing Latitude`,
            'any.required': `Could not identify your coordinates from address provided. Missing Latitude`,
         }),
      // })).options({ allowUnknown: true }),
   }).options({ allowUnknown: true }),
};
const profileUpdate = {
   body: Joi.object().keys({  
      password: Joi.string().optional().min(8)
      .pattern(/\d/, { name: 'numbers'}) //At least one digit
      .pattern(/[a-z]/, { name: 'oneLowerCase'}) //At least one digit
      .pattern(/[A-Z]/, { name: 'oneUpperCase'}) //At least one digit
      .pattern(/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, { name: 'specialChar'}) //At least one digit
      .messages({
        'string.pattern.name': `Password must contain at least one digit, one lowercase, one uppercase and one special character`,
        'string.min': `Password must be at least 8 characters`,
        'string.empty': `Password cannot be an empty field`,
        'any.required': `Password is a required field`,
      }),
   }).options({ allowUnknown: true }),
};
const changePassword = {
   body: Joi.object().keys({  
      oldPassword: Joi.string().required().min(8)
      .pattern(/\d/, { name: 'numbers'}) //At least one digit
      .pattern(/[a-z]/, { name: 'oneLowerCase'}) //At least one digit
      .pattern(/[A-Z]/, { name: 'oneUpperCase'}) //At least one digit
      .pattern(/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, { name: 'specialChar'}) //At least one digit
      .messages({
        'string.pattern.name': `Password must contain at least one digit, one lowercase, one uppercase and one special character`,
        'string.min': `Password must be at least 8 characters`,
        'string.empty': `Password cannot be an empty field`,
        'any.required': `Password is a required field`,
      }),
      newPassword: Joi.string().required().min(8)
      .pattern(/\d/, { name: 'numbers'}) //At least one digit
      .pattern(/[a-z]/, { name: 'oneLowerCase'}) //At least one digit
      .pattern(/[A-Z]/, { name: 'oneUpperCase'}) //At least one digit
      .pattern(/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/, { name: 'specialChar'}) //At least one digit
      .messages({
        'string.pattern.name': `Password must contain at least one digit, one lowercase, one uppercase and one special character`,
        'string.min': `Password must be at least 8 characters`,
        'string.empty': `Password cannot be an empty field`,
        'any.required': `Password is a required field`,
      }),
      confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).messages({
         'any.only': `New password and Confirm password must match`,
      }),
   }).options({ allowUnknown: true }),
};

module.exports = {
  signup,
  completeTntCreatn,
  createUser,
  profileUpdate,
  createAddress,
  changePassword,
};
