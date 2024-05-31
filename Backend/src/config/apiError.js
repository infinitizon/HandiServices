const Validator = require('../server/middleware/validate');
const ErrorValidation = require('../server/validations/error.validations');
// 
class ApiError extends Error {
   constructor(message, line, file, options = {}) {
      const error = Validator.validate(ErrorValidation.parameters, {body: {line, file}})
      if(error) {
         super(`ApiError: ${message} <=> ${error.stack}: ${error.message}`);
         // console.error(`ApiError: ${message} <=> ${error.stack}: ${error.message}`)
         // Logger.error(`ApiError: ${message} <=> ${error.stack}: ${error.message}`)
      } else {
         super(message)
         this.line = line;
         this.file = file;

         this.name = options.name ?? this.name;
         this.success = false;
         this.status = options?.status;
         this.show = this.name?.toLowerCase()?.includes('sequelize') ? false : options.show ?? true;
         this.data = options.data;
      }
      Error.captureStackTrace(this, this.constructor);
   }
}

module.exports = ApiError;
