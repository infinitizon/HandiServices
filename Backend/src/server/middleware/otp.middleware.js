
const AppError = require('../../config/apiError');
const db = require('../../database/models');
const OtpService = require('../services/otp.service');
const Helper = require('../utils/helper');

class OTPMiddleware {
   static async generate(req, res, next) {
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         let { email } = req.body;
         if ( !email ) throw new AppError('Email are required', __line, __path.basename(__filename), { status: 400, show: true });
         const user = await db[process.env.DEFAULT_DB].models.User.findOne({
            where: { [db.Sequelize.Op.or]: {
                  ...(email && {email: {[db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: email}})
               }
            },
         });
         if (!user) throw new AppError("User account not found!", __line, __path.basename(__filename), { status: 404, show: true });
                  
         const token = await db[process.env.DEFAULT_DB].models.Token.findOrCreate({
            where: { userId: user.id },
            defaults: {
               token: Helper.generateOTCode(6, false),
            },
            transaction: t
         },);

         const otp = token[1] ? token[0].token : token[0].token
         
         req.body = {...req.body, otp, user}

         await t.commit();
         next();
      } catch (error) {
         await t.rollback();
         console.error(error.message);
         return next(
               new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async verify (req, res, next) {
      try {
         let { token, email } = req.body;
         if (!token || !email) throw new AppError('Token and user id/email are required', __line, __path.basename(__filename), { status: 400, show: true });
         const verified = await (new OtpService).verifyOTP({ token, email });
         if (!verified || !verified.success) 
            throw new AppError(verified.message||'OTP Verification Failed', verified.line||__line, verified.file||__path.basename(__filename), {status: verified.status||404});
         
         next();
      } catch (error) {
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show }
            )
         );
      }
   }
}
module.exports = OTPMiddleware;