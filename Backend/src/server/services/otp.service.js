const Helper = require('../utils/helper');
const AppError = require('../../config/apiError')
const genericRepo = require('../../repository');
const { postgres, Sequelize } = require('../../database/models');
const EmailService = require('../services/email-builder.service');

class OtpService {
  async generateOTP ({email, subject, message, next}) {
    try {
      const user = await genericRepo.setOptions('User', {
        condition: { email: { [Sequelize.Op.iLike]: email } },
      }).findOne();
      if (!user) throw new AppError("Account not registered, please sign up", __line, __path.basename(__filename), { status: 404, show: true });
      let otp = Helper.generateOTCode(6, false);
      let tokenExists = await genericRepo.setOptions('Token', {
          condition: { used: false, userId: user.id },
      }).findOne();
      if (tokenExists) {
          await tokenExists.update({ createdAt: Date.now(), token: otp });
      } else {
          await genericRepo.setOptions('Token', {
              data: { token: otp, userId: user.id },
          }).create();
      }
      new EmailService({ recipient: user.email, sender: 'info@HandiServices.com', subject: subject ? subject : 'One Time Password' })
          .setCustomerDetails(user)
          .setEmailType({ type: 'resend_otp', meta: { user, otp, message } })
          .execute();
      return { success: true, message: 'OTP generated successfully'}
    } catch (error) {
      console.error(error.message);
      return next(
          new AppError(
          error.message
          , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
      );
    }
  }

  async verifyOTP ({ token, email, }) {
     try {
        let user = await postgres.models.User.findOne({ where: { email: { [ Sequelize.Op.iLike]: email }} });
        if (!user) throw new AppError('User does not exist.', __line, __path.basename(__filename), { status: 404, show: true });
        if (!token) throw new AppError('Token is required', __line, __path.basename(__filename), { status: 400, show: true });
        const tokenExists = await postgres.models.Token.findOne({ where: { token, userId: user.id }, });
        
        if (!tokenExists || tokenExists.used)
           throw new AppError('Invalid or expired token', __line, __path.basename(__filename), { status: 403, show: true });

        const checkToken = await Helper.checkToken({ time: process.env.TOKEN_TIME, tokenTime: tokenExists.createdAt })
        if (!checkToken) {
           await tokenExists.destroy({ force: true })
           throw new AppError('Invalid or expired token', __line, __path.basename(__filename), { status: 403, show: true });
        }
        await user.update({ verified: true });
        await tokenExists.update({ used: true })
        return { success: true, message: 'OTP verified successfully', };
     } catch (error) {
        console.log(error.message);
        return new AppError(
           error.message
           , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
        );
     }
  }
}
module.exports = OtpService;
