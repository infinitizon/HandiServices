
const AppError = require('../../config/apiError')
const { postgres, Sequelize } = require('../../database/models');
const Pagination = require('../utils/pagination');
const genericRepo = require('../../repository');

class TenantService {
   async getTenant ({tenantId, tenantName, includes=[], roles=[],}) {
      try {
         let criteria = {
            where: {[Sequelize.Op.or]: []},
            include: [
               { model: postgres.models.Product, attributes: ['id','pId','title'] },
               {
                  model: postgres.models.TenantUserRole,
                  where: {tenantId},
                  attributes: ['role_id'],
                  include: [],
               },
               {model: postgres.models.Address},
            ]
         }
         if(tenantId || tenantName) {
            tenantId? criteria.where[Sequelize.Op.or].push({id: tenantId}) : 0;
            tenantName ? criteria.where[Sequelize.Op.or].push({name: tenantName}) : 0;
         }
         for(let include of includes) {
            if(include == 'User') {
               criteria.include[0].include.push(
                  { model: postgres.models.User, attributes: {exclude: ['password']},},
               )
            } else {
               criteria.include.push(
                  { model: postgres.models[include]},
               )
            }
         }
         if(roles.length > 0) {
            criteria.include[0].include.push(
               { model: postgres.models.Role, attributes: ['name'], where: {name: roles},},
            )
         }
         const tenant = await postgres.models.Tenant.findAll(criteria) || [];
         return { success: true, status: 200, message: `Tenant retrieved successfully`, data: tenant }
      } catch (error) {
          return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getTenants ({tenantId, query}) {
      try {
         const { search } = query;
         let condition = {[Sequelize.Op.and]: Sequelize.literal(`"Tenant"."id" IN (SELECT * FROM ( WITH RECURSIVE cte AS ( SELECT id FROM tenants WHERE id='${tenantId}' UNION ALL SELECT t.id FROM tenants t JOIN cte ON cte.id=t.p_id ) SELECT * FROM cte)t)`)}
         if (search) {
            condition = {
               ...condition,
               [Sequelize.Op.or]: [
                  { name: { [Sequelize.Op.iLike]: `%${search}%` }, },
                  { email: { [Sequelize.Op.iLike]: `%${search}%` }, },
                  { phone: { [Sequelize.Op.iLike]: `%${search}%` }, },
               ],
            };
         }
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const count = await postgres.models.Tenant.findOne({
            attributes: [[Sequelize.literal(`COUNT("Tenant"."id")`), 'count']],
         })
         const tenants = await postgres.models.Tenant.findAll({
            include: [
               { model: postgres.models.Product, attributes: ['id','title', 'type'] },
               { model: postgres.models.Media, },
            ],
            where: condition,
            offset, limit,
         })
         return { success: true, status: 200, message: `Receiving Agents fetched successfully`, total: count.dataValues.count, data: tenants, };

      } catch (error) {
          return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getTenantTypes ({typeId, query}) {
      try {
         let criteria = {
            where: {},
            includes: []
         }
         if(typeId) {
            criteria.where['id'] =  typeId;
         }
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const types = await postgres.models.TenantType.findAll({
            where: criteria.where,
            offset, limit,
         }) || [];
         return { success: true, status: 200, message: `Tenant types retrieved successfully`, total: types.count, data: (typeId?types[0]||{} : types), };

      } catch (error) {
          return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async createTenants ({tenants, creatorTenant,  transaction}) {
      const t = transaction ?? await postgres.transaction()
      try {
         let createdTenants = [];
         // Generate user cred then create
         for (const tnt of tenants) {
            tnt.pId = creatorTenant.id;
            
            const exists = await postgres.models.Tenant.findOne({ where: { email: { [ Sequelize.Op.iLike]: tnt.email }} })
            if(exists) throw new AppError(`Email provided already exists. No two businesses can have thesame email`, __line, __path.basename(__filename), { status: 404, show: true });

            const category = await postgres.models.Product.findOne({where: {id: [tnt.category]}});
            if(!category) throw new AppError(`Category with id: '${tnt.category}' does not exist`, __line, __path.basename(__filename), { status: 404, show: true });
            const createdTnt = await genericRepo.setOptions('Tenant', {
               data: tnt,
               inclussions: [{ model: postgres.models.Address },{ model: postgres.models.Product }],
               transaction: t,
            }).create();
            await createdTnt.addProduct(category, { transaction: t, returning: true })
            createdTenants.push(createdTnt)
         }

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Asset Banks created successfully`, data: createdTenants }
      } catch (error) {
         console.log(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async updateTenant ({tenantId, creatorTenant, changes, transaction}) {
      const t = transaction ?? await postgres.transaction()
      try {
         
         // let tenantType = 'SUB_AGENT';
         // let createdTenants = [];
         // Generate user cred then create
         // for (const tnt of changes) {
            creatorTenant?changes.pId = creatorTenant.data.id:0;
            
            const {Media, Addresses, ...tntChanges} = changes;
            const tenant = await postgres.models.Tenant.findByPk( tenantId, {
               include: [{
                  model: postgres.models.Media, where: { ...(Media && {objectType: Media.objectType})}, required: false 
               }]
            });            
            if(Media) {
               const media = tenant.Media;
               if(media.length > 0) { // update
                  await media[0].update(Media, { transaction: t });
               } else { // create
                  await tenant.createMedium(Media, { transaction: t });
               }
            }
            for(let address of Addresses) {
               if(address.id) {
                  await postgres.models.Address.update(address, {where: {id:address.id}})
               } else {
                  await tenant.createAddress(address);
               }
            }
            await tenant.update(tntChanges, { include: [{
               model: postgres.models.Address, required: false 
            }], transaction: t });
            // createdTenants.push(tenant)
         // }

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Tenant updated successfully`, data: tenant }
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
   async updateTntUsrRole ({user, role, tenant,  transaction}) {
      const t = transaction ?? await postgres.transaction()
      try {
         
         console.log(JSON.parse(JSON.stringify(user.TenantUserRoles[0])));
         let updated = await postgres.models.TenantUserRole.update({
               tenantId: tenant.id,
               roleId: role.id
            },{
            where: {
               userId: user.id, 
               tenantId: user.TenantUserRoles[0]?.Tenant?.id,
               roleId: user.TenantUserRoles[0]?.Role?.id
            },
            transaction: t
         });
         // let currTntUsrRole = await postgres.models.TenantUserRole.findOne({
         //    where: {
         //       userId: user.id, 
         //       tenantId: user.TenantUserRoles[0]?.Tenant?.id,
         //       roleId: user.TenantUserRoles[0]?.Role?.id
         //    },
         //    transaction: t
         // });
         // const updated = await currTntUsrRole.update({
         //    tenantId: tenant.id,
         //    roleId: role.id
         // },{ transaction: t});

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `User updated to provider`, data: updated }
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
}

module.exports = TenantService;