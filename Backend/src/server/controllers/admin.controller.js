// const moment = require('moment');
const genericRepo = require('../../repository');
const AppError = require('../../config/apiError');
const db = require('../../database/models');

const {TenantService, UserService, AssetService, EmailService, OrderService } = require('../services');
const Pagination = require('../utils/pagination');
const TemplateService = require('../services/template.service');
const { downloadFile, successResponse } = require('../utils/responder');
const Gateways = {
  flutterwave: require('../services/gateways/flutterwave.service'),
  paystack: require('../services/gateways/paystack.service'),
  gtsquad: require('../services/gateways/gtbanksquad.service')
}

class AdminController {
   static async getUsers (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'For getting all users. Only admin can get all users'
       * #swagger.parameters['page'] = {
             in: 'query',
            description: 'Page number',
            required: false,
            type: 'integer'
         }
      * #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Number of items per page',
            required: false,
            type: 'integer'
         }
      * #swagger.parameters['search'] = {
            in: 'query',
            description: 'Search for a user',
            required: false,
            type: 'string'
         }
      * #swagger.responses[200] = {
            description: 'Users retrieved successfully',
            schema: { $ref: "#/components/schemas/User" }
         }
      * #swagger.responses[404] = {
            description: 'No user found'
         }
      * #swagger.responses[500] = {
            description: 'Server error'
         }
      */
      
      try {
         const { tenantId } = res.locals.user;
         const { search, r } = req.query;
         const { limit, offset } = Pagination.getPagination(req.query.page, req.query.perPage);

         let condition = '';
         if (search) {
            condition = `(u.first_name ILIKE '%${search}%' OR u.last_name ILIKE '%${search}%' OR u.email ILIKE '%${search}%' OR u.phone ILIKE '%${search}%')`
         }
         let userCustomeRole = '';
         let hasCustInRole = false;
         if (r) {
            userCustomeRole = `AND (`;
            r.split(',').forEach(role => {
               if(role?.toUpperCase()==='CUSTOMER') hasCustInRole = true;
               userCustomeRole += `"TenantUserRoles->Role"."name" = '${role}' OR `;
            });
            userCustomeRole = userCustomeRole.replace(/ OR $/, "");
            // eslint-disable-next-line no-unused-vars
            userCustomeRole += `)`;
         }
         
         let query = `
            SELECT {{fields}}
            FROM users u
            JOIN tenant_user_roles "TenantUserRoles" ON u.id="TenantUserRoles".user_id 
               AND "TenantUserRoles"."tenant_id" IN (${hasCustInRole?"SELECT * FROM ( WITH RECURSIVE cte AS ( SELECT id FROM tenants WHERE id='"+(req.query.tenantId||tenantId)+"' UNION ALL SELECT t.id FROM tenants t JOIN cte ON cte.id=t.p_id ) SELECT * FROM cte)t":"'" + (req.query.tenantId||tenantId) + "'" }) 
            JOIN roles "TenantUserRoles->Role" ON "TenantUserRoles".role_id="TenantUserRoles->Role".id {{userCustomeRole}}
            JOIN tenants "TenantUserRoles->Tenant" ON "TenantUserRoles".tenant_id="TenantUserRoles->Tenant".id
            {{condition}} 
         `;
         query = query.replace(/{{condition}}/g, condition);
         query = query.replace(/{{userCustomeRole}}/g, userCustomeRole);

         const countQuery = query.replace(/{{fields}}/g, `COUNT(u.id) as count`)
         const countResult = await db[process.env.DEFAULT_DB].query(countQuery, {
            type: db.Sequelize.QueryTypes.SELECT
         });

         query = query.replace(/{{fields}}/g, `u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, u.phone, u.created_at AS "createdAt"
               , "TenantUserRoles->Role"."id" AS "TenantUserRoles.Role.id", "TenantUserRoles->Role"."name" AS "TenantUserRoles.Role.name", "TenantUserRoles->Tenant"."id" AS "TenantUserRoles.Tenant.id"
               , "TenantUserRoles->Tenant"."name" AS "TenantUserRoles.Tenant.name"`);
         
         query = `${query} ORDER BY u."created_at" DESC OFFSET ${offset} LIMIT ${limit}`;
         const users = await db[process.env.DEFAULT_DB].query(query, {
            nest: true,
            type: db.Sequelize.QueryTypes.SELECT
         });
         res.status(200).json({ success: true, message: `Users retrieved successfully`, count: countResult[0]?.count, users });
      }
      catch (error) {
         console.error(error.message);
         return next(
         new AppError(
            error.message, error.line || __line, 
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
         );
      }
   }
   
   static async getUser (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'For getting a user. Only admin can get a user'
       * #swagger.parameters['id'] = {
             in: 'path',
            description: 'The ID of the user to get',
            required: true,
            type: 'string',
         }
      * #swagger.responses[200] = {
            description: 'User retrieved successfully',
            schema: { $ref: "#/components/schemas/User" }
         }
      * #swagger.responses[404] = {
            description: 'User not found'
         }
      * #swagger.responses[500] = {
            description: 'Server error'
         }
      */
      try {
         const { userId } = req.params;
         // const { tenantId } = res.locals.user;

         const user = await UserService.getDetails({userId,})

         if (!user) throw new AppError(`User does not exist`, __line, __path.basename(__filename), { status: 404 });

         delete user.dataValues.password;
         res.status(200).json(user);
      } catch (error) {
         console.error(error.message);
         return next(
         new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
         );
      }
   }
   static async createUsers (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'Upload an excel sheet or manually create users. Only admin can upload users.'
       * #swagger.parameters['sheet'] = {
             in: 'files',
            description: 'Excel sheet to upload',
            required: true,
            type: 'file',
      }
      * #swagger.responses[201] = {
            description: 'User(s) created successfully',
            schema: { $ref: "#/components/schemas/User"}
      }
      * #swagger.responses[400] = {
            description: 'Please provide a sheet to process'
      }
      * #swagger.responses[500] = {
            description: 'Server error'
      }
      * 
      */
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         const { tenantId } = res.locals.user;
         let { header, details } = req.body;

         const userService = new UserService
         const tenantService = new TenantService

         const { data: tenants, ...tenantInfo } = await tenantService.getTenant({ tenantId: header.tenantId||tenantId});
         if(!tenantInfo.success) throw new AppError(tenantInfo.message, __line, __path.basename(__filename), { status: tenantInfo.status||404 });

         const { data: roles, ...roleInfo } = await userService.getRoles({roleName: header.userRole});
         if(!roleInfo.success) throw new AppError(roleInfo.message||'Role specified does not exist', __line, __path.basename(__filename), { status: 404 });

         let users = [];
         const password = '123456789';

         // Generate user cred then create
         for (const user of details) {
            user.password = password;
            const {data: createdUser, ...userInfo} = await userService.createUser({user, tenant: tenants[0], role: roles[0], transaction: t});
            if(!userInfo.success)
               throw new AppError(userInfo.message, userInfo.line||__line, userInfo.file||__path.basename(__filename), { status: userInfo.status||404 });
            users.push(createdUser)
         }
         for (const user of users) {
            // ***** Notify customer by email
            new EmailService({ recipient: user.email, sender: tenants[0].email, subject: 'You have been created on Primary Offer'})
                .setCustomerDetails(user)
                .setEmailType({ type: 'admin-create-user', meta: { user, password, tenant: tenants[0], role: roles[0] } })
                .execute();
         }
         const resp = { code: 201, success: true, message: 'User(s) created successfully', data: users };
         t.commit()
         res.status(201).json(resp);
      } catch (error) {
         t.rollback();
         console.error(error.message);
         return next(
            new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
            )
         );
      }
   }

   static async updateUser (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'For user update. Only admin can update a user'
       * #swagger.parameters['id'] = {
               in: 'path',
               description: 'The ID of user to be updated',
               required: true,
               type: 'string',
         } 
      *  #swagger.parameters['obj'] = {
                  in: 'body',
                  description: 'Update a user',
                  schema: { $ref: "#/components/schemas/User" }
         }
         * #swagger.responses[200] = {
               description: 'User updated successfully',
               schema: { $ref: "#/components/schemas/User" }
         }
         * #swagger.responses[404] = {
               description: 'User/Role does not exist'
         }
         * #swagger.responses[500] = {
               description: 'Server error'
         }
         */
      try {
         const { role, ...userUpdates } = req.body;
         const { userId, tenantId } = res.locals.user;
         const { id } = req.params;

         const userRole = await genericRepo.setOptions('TenantUserRole', {
            condition: { userId, tenantId },
            selectOptions: ['role_id'],
            inclussions: [{ model: db[process.env.DEFAULT_DB].models.Role, attributes: ['name'] }]
         }).findOne();

         const user = await genericRepo.setOptions('User', { condition: { id } }).findOne();
         
         if (!user) throw new AppError('User does not exist', __line, __path.basename(__filename), { status: 404 });
         
         if (role) {
            const roleExists = await genericRepo.setOptions('Role', {
               condition: { id: role },
               selectOptions: ['name']
            }).findOne();
            
            if (!roleExists) throw new AppError('Role does not exist', __line, __path.basename(__filename), { status: 404 });
            // TODO: Remove this after using user role from header
            if (userRole.Role.name === 'PROVIDER_ADMIN' && roleExists.name === 'SUPER_ADMIN') throw new AppError('You are not allowed to assign a SUPER_ADMIN role', __line, __path.basename(__filename), { status: 403 });
            
            await genericRepo.setOptions('TenantUserRole', {
               changes: { roleId: role },
               condition: { userId: id, tenantId },
               returning: true
            }).update();
         }

         const updatedUser = await genericRepo.setOptions('User', {
            changes: userUpdates,
            returning: true,
            condition: { id }
         }).update();
         delete updatedUser[1][0].dataValues.password;
         res.status(200).json(updatedUser[1][0]);
      } catch (error) {
         console.error(error.message);
         return next(
         new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
         );
      }
   }

   static async deleteUser (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'For user deletion. Only admin can delete a user'
       *  #swagger.parameters['id'] = {
                   in: 'path',
                  description: 'The ID of the user to delete',
                  required: true,
                  type: 'string',
         }
         * #swagger.responses[204] = {
               description: 'User deleted successfully'
         }
         * #swagger.responses[404] = {
               description: 'User does not exist'
         }
         * #swagger.responses[500] = {
               description: 'Server error'
         }
         */
      try {
         const { id } = req.params;
         const { userId, tenantId } = res.locals.user;

         const userRole = await genericRepo.setOptions('TenantUserRole', {
            condition: { userId, tenantId },
            selectOptions: ['roleId'],
            inclussions: [{ model: db[process.env.DEFAULT_DB].models.Role, attributes: ['name'] }]
         }).findOne();

         // TODO: Remove this after using user role from header
         // eslint-disable-next-line no-undef
         if (userRole.Role.name === 'TENANT_ADMIN' && roleExists.name === 'SUPER_ADMIN') throw new AppError('You are not allowed to delete a user with this role', __line, __path.basename(__filename), { status: 403 });

         const user = await genericRepo.setOptions('User', {
            condition: { id },
         }).findOne();

         if (!user) throw new AppError('User does not exist', __line, __path.basename(__filename), { status: 404 });

         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('TenantUserRole', {
            condition: { userId: id, tenantId },
         })._delete();

         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('User', {
            condition: { id },
         })._delete();

         res.status(204).json({ message: 'User deleted successfully' });
      } catch (error) {
         console.error(error.message);
         return next(
         new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
         );
      }
   }
   static async getAssetBanks (req, res, next) {
      /**
         * #swagger.description = 'Create Offer Banks'
         * #swagger.responses[200] = {
            description: 'Offer Bank Added',
            schema: {
               $success: true,
               $data: {
                        $id: "1710497164",
                        $parent_id: "",
                        $commonType: "agoodey@chapelhilldenham.com",
                        $commonId: "INVESTIN LIMITED-PLANIN",
                        $bank_name: "1",
                        $name_on_account: "DR",
                        $account_number: "agoodey@chapelhilldenham.com",
                        $bank_code: "INVESTIN LIMITED-PLANIN",
                        $business_name: "1",
                        $transaction_type: "DR",
                        $split: "INVESTIN LIMITED-PLANIN",
                        $createdAt: "1",
                        $updatedAt: "DR",
                        $AssetBankGateways: [
                           { 
                           $id: "paystack",
                           $gateway: "card",
                           $business_secret: "paystack",
                           $sub_account_id: "card",
                           $meta_id: "paystack",
                           $asset_bank_id: "card",
                           $details: "paystack",
                           $type: "card",
                           $name: "paystack",
                           $logo: "card",
                           },
                        ]
                  
               },
            }
         }
         * #swagger.responses[404] = {
               description: 'No Offer Bank found'
            }
         * #swagger.responses[500] = {
               description: 'Server error'
            }
         */
      try{
         const {parentId} = req.query
         const {assetId} = req.params
         
         const assetService = new AssetService();
         let asset = await assetService.getAsset({ assetId });
         if (!asset || !asset.success) 
            throw new AppError(asset.message||'Asset not found', asset.line||__line, asset.file||__path.basename(__filename), { status: asset.status||400, show: asset.show });
         
         let accounts
         if(parentId){
            accounts = await genericRepo.setOptions('AssetBank', {
               condition: {parentId: parentId},
               inclussions: [
                  {
                  model: db[process.env.DEFAULT_DB].models.AssetBankGateway
                  }
               ]
            }).findOne()
         } else {
            accounts = await asset.data.getAssetBanks({
               attributes: ['id','bankName', 'accountNumber', 'bankCode', 'split'],
               where: { parentId: null },
            })
         }
         return successResponse(req, res, accounts, `Records fetched successfully`)
      }catch(error){
         console.error(error.message);
         return next(
                     new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
               );
      }
   }
   static async updateAssetBanks (req, res, next) {
      let t = await db[process.env.DEFAULT_DB].transaction();
      let bulkCreate = [];
      try {
         const { code, name } = req.body.bank;
         const bankCode = code,
         // eslint-disable-next-line no-unused-vars
         bankName = name,
         businessName = req.body.nameOnAccount;
         // eslint-disable-next-line no-underscore-dangle
         const Gateways_ = req.body.gateways;
         const updateBody = req.body;
         delete updateBody.bank;
         delete updateBody.gateways;
         delete updateBody.name_on_account;
         await genericRepo.setOptions('AssetBank', {
            changes: {
               bankCode,
               businessName,
               ...updateBody,
            },
            condition: {
               id: req.params.id,
            }
         })
         const gateways = await genericRepo.setOptions('AssetBankGateway', {
            condition: { assetBankId: req.params.id }
         }).findAll()

         for (var gateway of gateways) {
            if (gateway.gateway === 'flutterwave') {
               const flutterCall = await (new Gateways['flutterwave']()).deleteSubaccount({id: gateway.metaId, businessSecret: gateway.businessSecret})
               if (!flutterCall.success)
               console.log('Flutterwave deleted');
                  throw new AppError('flutterwave update failed', __line, __path.basename(__filename), { status: 400, show: true });
            }
         }
         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('AssetBankGateway', {
            condition: { assetBankId: req.params.id },
            transaction: t
         })._delete()

         for (var items of Gateways_) {
         if (items.type === 'card') {
            const data = {
               businessName,
               bankCode,
               accountNumber: req.body.accountNumber,
               split: req.body.split,
               businessSecret: items.businessSecret
            };

            const response = await (new Gateways[items.name]()).createSubaccount(data)

            if (!response.success) throw new AppError(items.name + ' : ' + response.message, __line, __path.basename(__filename), { status: 400, show: true });
            bulkCreate.push({
               gateway: items.name,
               subAccountId: response.data.sub_account_id,
               assetBankId: req.params.id,
               metaId: response?.data?.meta_id,
               details: null,
               type: items.type,
               name: null,
               logo: null,
               businessSecret: items.businessSecret
            });
         }
            if (items.type === 'bank') {
               // eslint-disable-next-line no-underscore-dangle
               for (var item_ of items.details) {
                  bulkCreate.push({
                  gateway: null,
                  subAccountId: null,
                  assetBankId: req.params.id,
                  details: item_?.description,
                  type: items.type,
                  name: item_.name,
                  logo: null,
                  businessSecret: null
                  });
               }
            }
         }
         await genericRepo.setOptions('AssetBankGateway', {
            array: bulkCreate,
            transaction: t
         }).bulkCreate()
         await t.commit();
         res.status(200).send({ success: true, message: 'Account update successful', });
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );  
      }
   }
   static async deleteAssetBank (req, res, next) {
      try {
         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('AssetBank', {  
         condition: {
            [db.Sequelize.Op.or]: [
               { id: req.params.id },
               { parentId: req.params.id },
            ],
         },
         })._delete()

      

         // eslint-disable-next-line no-underscore-dangle
         const flutterwave_ = await genericRepo.setOptions('AssetBankGateway', {
         condition: {
            assetBankId: req.params.id,
            gateway: 'flutterwave',
         }
         }).findOne()
         // await db[process.env.DEFAULT_DB].models.saveplan_asset_banks_gateways.findOne({
         //   where: {
         //     saveplan_asset_bank_id: req.params.id,
         //     gateway: 'flutterwave',
         //   },
         // });
   
         // const flutterCall = await (new PaymentService).deleteSubaccount({gateway: 'flutterwave', data: {id: flutterwave_.meta_id, business_secret: flutterwave_.business_secret}});
         const flutterCall = await (new Gateways['flutterwave']()).deleteSubaccount({id: flutterwave_.metaId, businessSecret: flutterwave_.businessSecret});
         if (!flutterCall.success)
         throw new AppError('paystack update failed', __line, __path.basename(__filename), { status: 400, show: true });
   
         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('AssetBankGateway', {
            condition: { assetBankId: req.params.id }
         })._delete()
         // await db[process.env.DEFAULT_DB].models.saveplan_asset_banks_gateways.destroy({
         //   where: { saveplan_asset_bank_id: req.params.id },
         // });
   
         res.status(200).send({ success: true, message: 'Accounts deleted successful', });
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );  
      }
   }
   static async addAccounts (req, res, next) {
      try{
         // let { tenantId, role } = res.locals.user;         
         let { bankDetails } = req.body;

         let { id, nuban, bankCode, bankName, bankAccountName } = bankDetails;
         const beneficiary = await UserService.beneficiary({ id, userId: req.params.userId, nuban, bankCode, bankName, bankAccountName });
         if (!beneficiary.success) throw new AppError(beneficiary.message, __line, __path.basename(__filename), { status: beneficiary.status });
         
         res.status(beneficiary.status).json({ beneficiary })
         res.locals.resp = beneficiary;
      }catch(error){
         console.error(error.message);
         return next(
            new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );  
      }
   }
   static async addSecurityQuestion (req, res, next) {}
   static async updateSecurityQuestion (req, res, next) {}
   static async getSecurityQuestions (req, res, next) {}
   static async downloadTemplates (req, res, next) {
      try{
         const {templateName} = req.query
         const generate = await new TemplateService({templateName}).generate()
         return downloadFile(generate, res, `${templateName}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      }catch(error){
         console.error(error.message);
         return next(
            new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );  
      }
   }
   static async updateStatus (req, res, next) {
      /**
      * #swagger.description = 'Successfully approved bulk transaction'
      * #swagger.responses[200] = {
         description: 'Successfully approved bulk transaction',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {     
                     $message:"Successfully approved bulk transaction" 
                  }
         }
      }
         */
      try {
         const orderService = new OrderService

         const orders = await orderService.updateOrderStatus({ orderId: req.params.orderId, status: req.body.status })
         if(!orders || !orders.success)
            throw new AppError(orders.show?orders.message:`Error occured while fetching orders`, orders.line||__line, orders.file||__path.basename(__filename), { status: orders.status||409, show: orders.show});
         
         res.status(orders.status).json(orders);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
            )
         );
      }
   }
}

module.exports = AdminController;
