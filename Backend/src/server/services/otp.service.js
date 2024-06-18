const Helper = require('../utils/helper');
const AppError = require('../../config/apiError')
const genericRepo = require('../../repository');
const db = require('../../database/models');
const EmailService = require('../services/email-builder.service');

class OtpService {
  async generateOTP ({email, subject, message, transaction, next}) {
    const t = transaction ?? await db[process.env.DEFAULT_DB].transaction();
    try {
      const user = await genericRepo.setOptions('User', {
        condition: { email: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: email } },
      }).findOne();
      if (!user) throw new AppError("Account not registered, please sign up", __line, __path.basename(__filename), { status: 404, show: true });
      let otp = Helper.generateOTCode(6, false);
      let tokenExists = await genericRepo.setOptions('Token', {
          condition: { used: false, userId: user.id },
          transaction: t
      }).findOne();
      if (tokenExists) {
          await tokenExists.update({ createdAt: Date.now(), token: otp }, { transaction: t });
      } else {
          await genericRepo.setOptions('Token', {
              data: { token: otp, userId: user.id },
              transaction: t
          }).create();
      }
      new EmailService({ recipient: user.email, sender: 'info@HandiServices.com', subject: subject ? subject : 'One Time Password' })
          .setCustomerDetails(user)
          .setEmailType({ type: 'resend_otp', meta: { user, otp, message } })
          .execute();
          
      transaction ? 0 : await t.commit();
      return { success: true, message: 'OTP generated successfully'}
    } catch (error) {
      console.error(error.message)
      transaction ? 0 : await t.rollback();
      return next(
          new AppError(
          error.message
          , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
      );
    }
  }

  async verifyOTP ({ token, email, transaction}) {
    const t = transaction ?? await db[process.env.DEFAULT_DB].transaction();
     try {
        if (!token) throw new AppError('Token is required', __line, __path.basename(__filename), { status: 400, show: true });

        let user = await db[process.env.DEFAULT_DB].models.User.findOne({ where: { email: { [ db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: email }} });
        if (!user) throw new AppError('User does not exist.', __line, __path.basename(__filename), { status: 404, show: true });

        const tokenExists = await db[process.env.DEFAULT_DB].models.Token.findOne({ where: { token, userId: user.id }, });
        if (!tokenExists || tokenExists.used)
           throw new AppError('Invalid or expired token', __line, __path.basename(__filename), { status: 403, show: true });

        const checkToken = await Helper.checkToken({ time: process.env.TOKEN_TIME, tokenTime: tokenExists.createdAt })
        if (!checkToken) throw new AppError('Invalid or expired token', __line, __path.basename(__filename), { status: 403, show: true });

        await user.update({ verified: true }, { transaction: t });
        await tokenExists.destroy({ force: true, transaction: t });

        transaction ? 0 : await t.commit();
        return { success: true, status: 200, message: 'OTP verified successfully', };
     } catch (error) {
        transaction ? 0 : await t.rollback();
        return new AppError(
           error.message
           , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
        );
     }
  }
}
module.exports = OtpService;
