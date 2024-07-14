// const Bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const jwt = require('jsonwebtoken');
// const redis = require('redis');
// const JWTR =  require('jwt-redis').default;

const AppError = require('../../config/apiError');
const db = require('../../database/models');
// const { getLimitStatus } = require('../utils/rateLimit');

class JwtService {
   static async createAccessToken ({signature, expiresIn='24h'}) {
      try {
         const token = jwt.sign(signature, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn
         })

         return { success: true, status: 200, token };
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??401, show: true}
         );
      }
   }
   async createResetToken (signature) {
      try {
         const token = jwt.sign(signature, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m"
         })
         // const token = await jwtr.sign(signature, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})

         return { success: true, token };
      } catch (error) {
         return new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
   static async verifyToken (token) {
      try {
         const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
         // const data = await jwtr.verify(token, process.env.ACCESS_TOKEN_SECRET);

         return { success: true, status: 200, data };
      } catch (error) {
         return new AppError(
               `Invalid or expired token`
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 401, show: error.show });
      }
   }
   static async destroyToken (token) {
      try {

         const {success, show, message, data} = await JwtService.verifyToken(token);
         if(!success)
            throw new AppError(show?message:`Token cannot be verified`, data.line || __line, data.file || __path.basename(__filename), { name: data.name, status: data.status ?? 500, show: data.show });
            
         // var older_token = jwt.sign({ ...data.data, iat: Math.floor(Date.now() / 1000) - 6400 }, process.env.ACCESS_TOKEN_SECRET);
         // await jwtr.destroy(jti)

         return { success: true, status: 200, message: `Token destroyed successfully`, data };
      } catch (error) {
         return new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
   async loginByEmail ({ email }) {
      try {
         let user = await db[process.env.DEFAULT_DB].models.User.findOne({
            attributes: ["id","bvn","firstName","lastName","firstLogin", "email","password", "refCode", "isEnabled", "isLocked", "twoFactorAuth", "uuidToken"],
            where: { email: {[db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: email}, },
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.TenantUserRole, 
                  include: [
                     { model: db[process.env.DEFAULT_DB].models.Tenant, attributes: ["id", "name"], },
                     { model: db[process.env.DEFAULT_DB].models.Role, attributes: ["name"], },
                  ]
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Address,
                  where: { isActive: true},
                  required: false
               }
            ],
         });
         if (!user) throw new AppError('User not found', __line, __path.basename(__filename), { status: 404, show: true });
         if (!user.isEnabled && user.isLocked) throw new AppError('Account inactive and locked. Please activate to continue', __line, __path.basename(__filename), { status: 423, show: true });
         // if (!user.isEnabled) throw new AppError('Account not active. Please activate to continue', __line, __path.basename(__filename), { status: 404, show: true });
         let userUpdate = {
            uuidToken: crypto.randomBytes(16).toString('hex')
         }
         if (user.firstLogin) {
            userUpdate.firstLogin = false;
         }
         await user.update(userUpdate, { where: { id: user.id } } );

         return { success: true, user };
      } catch (error) {
         return new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
   async getUserAndTenant ({ userId, tenantId }) {
      try {
         let user = await db[process.env.DEFAULT_DB].models.User.findOne({
            attributes: ["id","bvn","firstName","lastName","email", "password", "isEnabled", "isLocked"],
            where: { id: userId },
            include: [
               {
                  required: false,
                  model: db[process.env.DEFAULT_DB].models.TenantUserRole, where: { tenantId: tenantId||uuidv4()},
                  include: [
                     { model: db[process.env.DEFAULT_DB].models.Tenant, attributes: ["id", "name"], },
                     { model: db[process.env.DEFAULT_DB].models.Role, attributes: ["name"], },
                  ]
               }
            ],
         });
         if (!user) throw new AppError('User not found', __line, __path.basename(__filename), { status: 404, show: true });
         if (!user.isEnabled) throw new AppError('Account not active. Please activate to continue', __line, __path.basename(__filename), { status: 404, show: true });

         return { success: true, user };
      } catch (error) {
         return new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
}

module.exports = JwtService;
