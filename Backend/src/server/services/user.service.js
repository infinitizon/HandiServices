const Bcrypt = require('bcryptjs');
const db = require("../../database/models");
const HttpStatus = require("http-status");
const Helper = require('../utils/helper');
const AppError = require("../../config/apiError");
const VerificationsService = require('../services/verifications.service');

class UserService {
   async createUser({user, tenant, role, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         let salt = await Bcrypt.genSalt(12);
         user.password = await Bcrypt.hash(user.password || '123456789', salt);
         const emailExists = await db[process.env.DEFAULT_DB].models.User.findOne({
             attributes: ['id', 'email', 'bvn'],
             where: { [db.Sequelize.Op.or]: {
                 email: {[db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: user.email}
             } },
         });
         if (emailExists) throw new AppError('Email/BVN already registered', __line, __path.basename(__filename), { status: HttpStatus.CONFLICT, show: true });
         
         user.isEnabled = false;
         user.isLocked = true;
         // Generate refCode for user
         let refCode = user.firstName.charAt(0) + user.lastName.charAt(0);
         let refCodeExists = 0;
         user.refCode = null;
         do {
            user.refCode = refCode.replace(/[^a-zA-Z]/g, '').toUpperCase() + Helper.generatePassword(2, { includeSpecialChars: false });
            refCodeExists = await db[process.env.DEFAULT_DB].models.User.count({ where: { refCode: `${user.refCode}` }, });
         } while (refCodeExists > 0);

         const createdUser = await db[process.env.DEFAULT_DB].models.User.create({
            ...user
         }, { transaction: t });
         // Populate tenant user roles for user and create them
         await db[process.env.DEFAULT_DB].models.TenantUserRole.create({
            tenantId: tenant.id,
            userId: createdUser.id,
            roleId: role.id
         }, { transaction: t });

         delete createdUser.dataValues.password

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `User created successfully`, data: createdUser }
      } catch (error) {
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async updateProfile({userId, changes, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction();
      try {
         if(changes.password) {
            let salt = await Bcrypt.genSalt(12);
            changes.password = await Bcrypt.hash(changes.password, salt);
         }

         const {Media, ...userChanges} = changes;
         const user = await db[process.env.DEFAULT_DB].models.User.findByPk( userId, {
            attributes: {excludes: ['password', 'uuidToken']},
            include: [{
               model: db[process.env.DEFAULT_DB].models.Media, where: { ...(Media && {objectType: Media.objectType})}, required: false 
            },{
               model: db[process.env.DEFAULT_DB].models.Address, required: false 
            }]
         });
         if(Media) {
            const media = user.Media;
            if(media.length > 0) { // update
               await media[0].update(Media, { transaction: t });
            } else { // create
               await user.createMedium(Media, { transaction: t });
            }
         }
         await user.update(userChanges, { transaction: t });

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `User updated successfully`, data: user }
      } catch (error) {
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   static async getDetails({userId, tenantId}){
      let inclussions = [
         {
            model: db[process.env.DEFAULT_DB].models.Beneficiary,
            attributes: ['accountNumber', 'bankCode', 'accountName', 'bankName', 'active', 'id'],
            required: false
         },
         {
            model: db[process.env.DEFAULT_DB].models.Address,
            attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'state', 'country', 'isActive'], 
            required: false
         },
         { 
            model: db[process.env.DEFAULT_DB].models.NextOfKin,
            attributes: ['id', 'relationship', 'name', 'phone', 'email', 'address', 'isPrimary', 'isEnabled', 'isLocked'], 
            required: false
         },
         { 
            model: db[process.env.DEFAULT_DB].models.Media,
            required: false
         },
      ]
      if(tenantId){
         inclussions.push({
            model: db[process.env.DEFAULT_DB].models.TenantUserRole,
            where: {tenantId},
            attributes: ['roleId'],
            required: false,
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.Tenant,
                  attributes: ['id', 'name', ],
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Role,
                  attributes: ['id', 'name', 'description'],
               }
            ],
         })
      }
      const user = await db[process.env.DEFAULT_DB].models.User.findByPk(userId, {
         attributes: ['id', 'pId', 'bvn', 'refCode', 'referrer', 'firstName', 'middleName', 'lastName', 'email', 'refCode', 'deviceToken', 'dob', 'phone', 'gender', 'tier', 'showBalance', 'isEnabled', 'isLocked', 'twoFactorAuth', 'firstLogin', 'createdAt'],
         include: inclussions,
      })
      return tenantId ? this.reformat(user) : user;
   }

   static async getRoles  ({roleId, roleName}) {
      try{
         let criteria = {
            where: {[db.Sequelize.Op.or]: []},
            includes: []
         }
         // criteria.where['']
         if(roleId || roleName) {
            roleId? criteria.where[db.Sequelize.Op.or].push({id: roleId}) : 0;
            roleName ? criteria.where[db.Sequelize.Op.or].push({name: roleName}) : 0;
         }
         const data = await db[process.env.DEFAULT_DB].models.Role.findAll(criteria) || [];
         return { success: true, status: 200, message: `Role(s) fetched successfully`, data};
      }catch(error){
         return new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }
   async getUserRoles ({roleId, roleName}) {
      try{
         let criteria = {
            where: {[db.Sequelize.Op.or]: []},
            includes: []
         }
         // criteria.where['']
         if(roleId || roleName) {
            roleId? criteria.where[db.Sequelize.Op.or].push({id: roleId}) : 0;
            roleName ? criteria.where[db.Sequelize.Op.or].push({name: roleName}) : 0;
         }
         const data = await db[process.env.DEFAULT_DB].models.Role.findAll(criteria) || [];
         return { success: true, status: 200, message: `Role(s) fetched successfully`, data};
      }catch(error){
         return new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }

   static async beneficiary({ id, userId, nuban, bankCode, bankName, bankAccountName, transaction } ){
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try{
         const user = await db[process.env.DEFAULT_DB].models.User.findByPk(userId);
         if (!user.isEnabled || user.isLocked)
            throw new AppError('Verify your account to proceed', __line, __path.basename(__filename), { status: 403, show: true });
         
         let verifyNUBAN = await new VerificationsService({vendor: 'paystack'});
         const response = await verifyNUBAN.verifyNUBAN({
            userId, nuban, bankCode: bankCode,
         });
         if (!response.success) throw new AppError(response.message, __line, __path.basename(__filename), { status: response.status });

         let beneficiary =  await this.getBeneficiaries({ userId, bankCode });         
         if (!beneficiary || !beneficiary.success)
            throw new AppError(beneficiary.message||`Verify your account to proceed`, __line, __path.basename(__filename), { status: 403, show: true });

         beneficiary =  await this.addBeneficiary({ id, userId, nuban, bankCode, bankName, bankAccountName, transaction: t });
         if (!beneficiary || !beneficiary.success)
            throw new AppError(beneficiary.message||'Update beneficiary account to proceed.', __line, __path.basename(__filename), { status: 403, show: true });

         transaction ? 0 : await t.commit();
         return beneficiary // Looks like this{ success: true, status: httpStatus.CREATED, data: beneficiary };
      }catch(error){
         transaction ? 0 : await t.rollback();
         return new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }
   static reformat (user) {
      let tenants = [];
      user.TenantUserRoles.forEach((item)=> {
         const index = tenants.findIndex(t=>(t.id===item.Tenant.id));
         if (index < 0) {
            item.Tenant.dataValues.Roles = [item.Role];
            tenants.push(item.Tenant);
         } else {
            tenants[index].dataValues.Roles.push(item.Role);
         }
      });
      user.dataValues.Tenant = tenants;
      delete user.dataValues.TenantUserRoles;
      return user;
   }
   static async getBeneficiaries (userId, bankCode) {
      try {
         let condition = userId ;
         if(bankCode) condition = {...condition, bankCode};
         let beneficiaries = await db[process.env.DEFAULT_DB].models.Beneficiary.findAll({
            where: condition,
         }) || [];

         return {status: 200, success: true, data: beneficiaries, message: 'Beneficiaries fetched successfully'};
      } catch(error) {
         console.error(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }

   static async addBeneficiary ({ id, userId, nuban, bankCode, bankName, bankAccountName, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         let beneficiary;
         
         if (id) {
            beneficiary = await db[process.env.DEFAULT_DB].models.Beneficiary.update(
               {
                  accountNumber: nuban,
                  bankCode: bankCode,
                  accountName: bankAccountName,
                  bankName,
               },
               { where: { id, userId }, transaction: t }
            );
         } else {
            beneficiary = await db[process.env.DEFAULT_DB].models.Beneficiary.create({
               accountNumber: nuban,
               bankCode: bankCode,
               accountName: bankAccountName,
               userId,
               bankName,
               }, {transaction: t});
         }

         transaction ? 0 : await t.commit();
         return { status: 201, success: true, data: beneficiary, message: 'Beneficiary added successfully' };
      } catch(error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async createUpdateAddress ({ id, original, userId, changes, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         let address = null;
         if(id) {
            await original.update({...changes}, {transaction: t})
            const changed = await UserService.getAddresses(id)
            if (!changed || !changed.success) 
               throw new AppError(changed.show?changed.message:`Error getting address`, changed.line||__line, changed.line||__path.basename(__filename), { status: changed.status||400, show: changed.show});
            address = changed.data[0];
         } else {
            address = await db[process.env.DEFAULT_DB].models.Address.create({
               ...changes, userId
            }, {transaction: t})
         }
         transaction ? 0 : await t.commit();
         return { status: 201, success: true, data: address, message: 'Beneficiary added successfully' };
      } catch(error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
}

module.exports = UserService;