// import Joi from 'joi';
const Joi = require('joi')

const validateReq = (schema) => (req, res, next) => {
  try {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = check(validSchema, object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');
      // throw Error(errorMessage)
      throw new ValidatorError(errorMessage, __line, __path.basename(__filename), { status: 500, show: true});
    }
    Object.assign(req, value);
    return next();
  } catch (error) {
    // Logger.error(`${error.name} in file validate.js => ${error.message}`);
    // return next(error);
    return next(
      new ValidatorError(
          error.message
          , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
          , req, res, next
    ); 
  }
};

const check = (schema, data) => {
  const object = pick(data, Object.keys(schema));
  return Joi.compile(schema)
    .prefs({ errors: { label: 'key' } })
    .validate(object);
};

const validate = (schema, data) => {
  const { value, error } = check(schema, data);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    // throw new AppError(errorMessage, { status: 400, name: error.name });
    return error
  }

  return;
};

const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

class ValidatorError extends Error {
  constructor(message, line, file, options = {}) {
    super(message)
    this.line = line;
    this.file = file;

    this.name = options.name ?? this.name;
    this.success = false;
    this.status = options?.status;
    this.show = this.name === 'SequelizeDatabaseError' ? false : options.show ?? true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  validateReq, validate
}