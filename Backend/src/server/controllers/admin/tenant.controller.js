const AppError = require('../../../config/apiError');
const db = require('../../../database/models');
const { CloudObjUploadService, TenantService, UserService, OtpService, OrderService,} = require('../../services');


class TenantController {
   static async createTenants (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'Create receiving agents by upload or simple post. Only admins can upload receiving agents.'
       * #swagger.parameters['sheet'] = {
          in: 'files',
         description: 'Excel sheet to upload',
         required: true,
         type: 'file',
         }
      * #swagger.responses[201] = {
         description: 'Receiving agents uploaded successfully',
         schema: { $ref: "#/components/schemas/ReceivingAgent"}
         }
      * #swagger.responses[400] = {
         description: 'Please provide a sheet to process'
         }
      * #swagger.responses[500] = {
         description: 'Server error'
         }
      */
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         const auth = res.locals.user;
         const { header, details } = req.body;

         const tenantService = new TenantService;
         const { data: tenant, ...tntInfo } = await tenantService.getTenant({ tenantId: header.tenantId||auth.tenantId});
         if(!tntInfo.success)
            throw new AppError(tntInfo.message||`It's cold out here... You must have arrived here mistakenly`, tntInfo.line||__line, tntInfo.file||__path.basename(__filename), { status: tntInfo.status||404 });
      
         let tenants = tenantService.createTenants({tenants: details, creatorTenant: tenant[0], transaction: t});
         if(!tenants || !tenants.success)
            throw new AppError(tenants.message||`Error creating tenants`, tenants.line||__line, tenants.file||__path.basename(__filename), { status: tenants.status||409 });
      
         t.commit();
         res.status(tenants.status).json(tenants);
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
   static async completeUserTenant (req, res, next) {
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         let { userId, ...body } = req.body;

         const tenant = [{ ...body }];
         const creatorTenant = {id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d'}
         const userDetails = await UserService.getDetails({ userId, tenantId: creatorTenant.id})
         if(!userDetails || userDetails?.TenantUserRoles?.length <= 0)
            throw new AppError(`Can't find your user record. Please contact admin`, __line, __path.basename(__filename), { status: 404, show: true });
      
         const tenantService = new TenantService;
         const { data, message, ...tntInfo } = await tenantService.createTenants({ tenants: tenant, creatorTenant, transaction: t});
         if(!tntInfo.success)
            throw new AppError(tntInfo.show?message:`It's cold out here... You must have arrived here mistakenly`, tntInfo.line||__line, tntInfo.file||__path.basename(__filename), { status: tntInfo.status||404 });

         const getTntAdminRole = await UserService.getRoles({roleName: 'PROVIDER_ADMIN'});
         if(!getTntAdminRole.success)
            throw new AppError(getTntAdminRole.message||`We couldn't find a role for your shop. Please contact admin`, getTntAdminRole.line||__line, getTntAdminRole.file||__path.basename(__filename), { status: getTntAdminRole.status||404 });

         let tenants = await tenantService.updateTntUsrRole({user: userDetails, role: getTntAdminRole.data[0], tenant: data[0], transaction: t});
         if(!tenants || !tenants.success)
            throw new AppError(tenants.message||`Error completing your store`, tenants.line||__line, tenants.file||__path.basename(__filename), { status: tenants.status||409 });
      
         await (new OtpService).generateOTP({email: userDetails.email, transaction: t });
         
         t.commit();
         res.status(tenants.status).json(tenants);
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
   static async updateTenant (req, res, next) {
      /**
       * #swagger.tags = ['Admin']
       * #swagger.description = 'Create receiving agents by upload or simple post. Only admins can upload receiving agents.'
       * #swagger.parameters['sheet'] = {
          in: 'files',
            description: 'Excel sheet to upload',
            required: true,
            type: 'file',
         }
      * #swagger.responses[201] = {
         description: 'Receiving agents uploaded successfully',
         schema: { $ref: "#/components/schemas/ReceivingAgent"}
         }
      * #swagger.responses[400] = {
         description: 'Please provide a sheet to process'
         }
      * #swagger.responses[500] = {
         description: 'Server error'
         }
      */
      let uploaded;
      let uploaderService
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         // const auth = res.locals.user;
         let { details } = req.body;

         if(details.length > 1)
            throw new AppError(`You cannot update more than one tenant at a time`, __line, __path.basename(__filename), { status: 419 });
         if(req.files) {
            let { profile } = req.files;
            uploaderService = new CloudObjUploadService({service: 'cloudinary'});
            uploaded = await uploaderService.upload(profile);
            if(!uploaded || !uploaded.success)
               throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
            details[0] = {...details[0], Media: {
               name: profile.name,
               type: profile.mimetype,
               size: profile.size,
               objectType: 'profile',
               response: uploaded.data
            }}
         }
         const tenantService = new TenantService;
         const updated = await tenantService.updateTenant({ tenantId: req.params.tenantId, changes: details[0], transaction: t});
         if(!updated || !updated.success)
            throw new AppError(updated.message||`Error creating tenants`, updated.line||__line, updated.file||__path.basename(__filename), { status: updated.status||409 });
      
         t.commit();
         res.status(updated.status).json(updated);
         res.locals.resp = updated;
      } catch (error) {
         if(uploaded) {
            await uploaderService.delete({ id: uploaded.id });
         }
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
   
   static async getTenants (req, res, next) {
      try {
         const { tenantId } = res.locals.user;

         const tenantService = new TenantService;
         let tenants = await tenantService.getTenants({tenantId, query: req.query });
         if(!tenants || !tenants.success)
            throw new AppError(tenants.message||`Error creating tenants`, tenants.line||__line, tenants.file||__path.basename(__filename), { status: tenants.status||409 });
      
         res.status(tenants.status).json(tenants);
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
   static async getTenantTypes (req, res, next) {
      try {
         const { tenantId } = res.locals.user;

         const tenantService = new TenantService;
         let tenants = await tenantService.getTenantTypes({ tenantId, query: req.query });
         
         res.status(tenants.status).json(tenants);
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
   static async getTenant (req, res, next) {
      try {
         const { tenantId } = res.locals.user;
         let { includes, roles } = req.query;
         // if(includes || roles) {
         //    if(!includes || !roles)
         //       throw new AppError(`Includes and roles are not mutually exclusive in query`, __line, __path.basename(__filename), { status: 409 });
            includes ? includes = includes.split(',') : 0;
            roles ? roles = roles.split(',').map(v => v.toUpperCase()) : 0;
         // }

         const tenantService = new TenantService;
         let tenants = await tenantService.getTenant({tenantId: req.params.tenantId||tenantId, query: req.query, includes, roles });
         
         res.status(tenants.status).json(tenants);
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
   static async getTenantOrders (req, res, next) {
      try {
         const auth = res.locals.user;
         const params = req.params;
         const query = req.query;
         const orderService = new OrderService

         let tenantId = null;
         if(auth.role==='SUPER_ADMIN') tenantId = params.tenantId;
         if(auth.role==='PROVIDER_ADMIN') tenantId = auth.tenantId;

         const orders = await orderService.getOrders({ userId: query.userId, auth, tenantId, query })
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
   static async getTenantOrderDetails (req, res, next) {
      try {
         const auth = res.locals.user;
         const params = req.params;
         const query = req.query;
         const orderService = new OrderService

         let tenantId = null;
         if(auth.role==='SUPER_ADMIN') tenantId = params.tenantId;
         if(auth.role==='PROVIDER_ADMIN') tenantId = auth.tenantId;

         const orders = await orderService.getOrderDetails({ orderId: params.orderId, tenantId, query });
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

module.exports = TenantController;