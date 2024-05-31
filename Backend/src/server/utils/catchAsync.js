const AppError = require('../../config/apiError')
const catchAsync = (fn, file) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {return next(
    new AppError(
        error.message
        , error.line||file.line, error.file||__path.basename(file.filename), {name: error.name, status: error.status??500, show: error.show})
)});
};

module.exports = { catchAsync };
