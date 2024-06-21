const Bcrypt = require('bcryptjs');
const CryptoJS = require('../utils/crypto');
const AppError = require('../../config/apiError')
const OtpService = require('../services/otp.service');
const db = require('../../database/models');
const RateLimiter = require('../services/rate-limit.service');
const EmailService = require('../services/email-builder.service');

class AuthMiddleware {
  static async checkLoginDetails(req, res, next) {
    try {
      let { email, password } = req.body;
      password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(password);
      const user = await db[process.env.DEFAULT_DB].models.User.findOne({ 
        where: { email: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: email.trim() }  }, 
        attributes: ["id", "email", "password", "twoFactorAuth"],
      });
  
      if (!user) throw new AppError('Wrong email or password', __line, __path.basename(__filename), { status: 404, show: true });
      
      let correctPassword = Bcrypt.compareSync(password, user.password);
      if (!correctPassword) {
        let address = req.connection.remoteAddress;
        let limitRes = await (new RateLimiter).consumeLimit(address);
        if (limitRes < 2) {
        new EmailService({ recipient: user.email, sender: 'info@HandiServices.com', subject: 'Unsuccessful Login Attempt' })
            .setCustomerDetails(user)
            .setEmailType({ type: 'login_failed', meta: user })
            .execute();
        }
        throw new AppError(`Wrong email or password`, __line, __path.basename(__filename), { status: 400, show: true });
      }
      res.locals.user = {...user.dataValues};
      next();
    } catch (error) {
      console.error(error.message);
      return next(
          new AppError(
          error.message
          , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
      );
    }
  }

  static async check2FA (req, res, next) {
    try {
      let { email } = req.body;
      let user = res.locals.user;
      if (user && user['twoFactorAuth']) {
        const { token } = req.body;
    
        if (!token) {
          const resp = {
            status: 419,
            success: false,
            message: '2FA token required',
            require2fa: true,
          }
          throw new AppError(JSON.stringify(resp) , __line, __path.basename(__filename), {status: resp.status});
        } else {
          const verified = await (new OtpService).verifyOTP({ token, email });
          if (!verified || !verified.success) {
            throw new AppError(verified.message||'OTP Verification Failed', verified.line||__line, verified.file||__path.basename(__filename), {status: verified.status||404});
          }
        }
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
  }
}



module.exports = AuthMiddleware;