const AppError = require('../../config/apiError');
const OtpService = require('../services/otp.service');

const verifyOTPMiddleware = async (req, res, next) => {
  try {
    let { token, email } = req.body;
    if (!token || !email) throw new AppError('Token and email are required', __line, __path.basename(__filename), { status: 400, show: true });
    const verified = await (new OtpService).verifyOTP({ token, email });
    if (!verified || !verified.success) {
      throw new AppError(verified.message||'OTP Verification Failed', verified.line||__line, verified.file||__path.basename(__filename), {status: verified.status||404});
    }
    next();
    } catch (error) {
    console.error(error.message);
    return next(
        new AppError(
        error.message
        , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
    );
    }
};


module.exports = {
  verifyOTPMiddleware
}