
const AppError = require('../../config/apiError')
const db = require('../../database/models');
const Pagination = require('../utils/pagination');
const genericRepo = require('../../repository');

class TenantService {
   async getTenant ({tenantId, tenantName, includes=[], roles=[],}) {
      try {
         let criteria = {
            where: {[db.Sequelize.Op.or]: []},
            include: [
               { model: db[process.env.DEFAULT_DB].models.Product, attributes: ['id','pId','title'] },
               {
                  model: db[process.env.DEFAULT_DB].models.TenantUserRole,
                  where: {tenantId},
                  attributes: ['role_id'],
                  include: [],
               },
               {model: db[process.env.DEFAULT_DB].models.Address},
            ]
         }
         if(tenantId || tenantName) {
            tenantId? criteria.where[db.Sequelize.Op.or].push({id: tenantId}) : 0;
            tenantName ? criteria.where[db.Sequelize.Op.or].push({name: tenantName}) : 0;
         }
         for(let include of includes) {
            if(include == 'User') {
               criteria.include[0].include.push(
                  { model: db[process.env.DEFAULT_DB].models.User, attributes: {exclude: ['password']},},
               )
            } else {
               criteria.include.push(
                  { model: db[process.env.DEFAULT_DB].models[include]},
               )
            }
         }
         if(roles.length > 0) {
            criteria.include[0].include.push(
               { model: db[process.env.DEFAULT_DB].models.Role, attributes: ['name'], where: {name: roles},},
            )
         }
         const tenant = await db[process.env.DEFAULT_DB].models.Tenant.findAll(criteria) || [];
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
         let condition = {[db.Sequelize.Op.and]: db.Sequelize.literal(`"Tenant"."id" IN (SELECT * FROM ( WITH RECURSIVE cte AS ( SELECT id FROM tenants WHERE id='${tenantId}' UNION ALL SELECT t.id FROM tenants t JOIN cte ON cte.id=t.p_id ) SELECT * FROM cte)t)`)}
         if (search) {
            condition = {
               ...condition,
               [db.Sequelize.Op.or]: [
                  { name: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%` }, },
                  { email: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%` }, },
                  { phone: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%` }, },
               ],
            };
         }
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const count = await db[process.env.DEFAULT_DB].models.Tenant.findOne({
            attributes: [[db.Sequelize.literal(`COUNT("Tenant"."id")`), 'count']],
         })
         const tenants = await db[process.env.DEFAULT_DB].models.Tenant.findAll({
            include: [
               { model: db[process.env.DEFAULT_DB].models.Product, attributes: ['id','title', 'type'] },
               { model: db[process.env.DEFAULT_DB].models.Media, },
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
         const types = await db[process.env.DEFAULT_DB].models.TenantType.findAll({
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
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         let createdTenants = [];
         // Generate user cred then create
         for (const tnt of tenants) {
            tnt.pId = creatorTenant.id;
            
            const exists = await db[process.env.DEFAULT_DB].models.Tenant.findOne({ where: { email: { [ db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: tnt.email }} })
            if(exists) throw new AppError(`Email provided already exists. No two businesses can have thesame email`, __line, __path.basename(__filename), { status: 404, show: true });

            const category = await db[process.env.DEFAULT_DB].models.Product.findOne({where: {id: [tnt.category]}});
            if(!category) throw new AppError(`Category with id: '${tnt.category}' does not exist`, __line, __path.basename(__filename), { status: 404, show: true });
            const createdTnt = await genericRepo.setOptions('Tenant', {
               data: tnt,
               inclussions: [{ model: db[process.env.DEFAULT_DB].models.Address },{ model: db[process.env.DEFAULT_DB].models.Product }],
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
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         
         // let tenantType = 'SUB_AGENT';
         // let createdTenants = [];
         // Generate user cred then create
         // for (const tnt of changes) {
            creatorTenant?changes.pId = creatorTenant.data.id:0;
            
            const {Media, Addresses, ...tntChanges} = changes;
            const tenant = await db[process.env.DEFAULT_DB].models.Tenant.findByPk( tenantId, {
               include: [{
                  model: db[process.env.DEFAULT_DB].models.Media, where: { ...(Media && {objectType: Media.objectType})}, required: false 
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
                  await db[process.env.DEFAULT_DB].models.Address.update(address, {where: {id:address.id}})
               } else {
                  await tenant.createAddress(address);
               }
            }
            await tenant.update(tntChanges, { include: [{
               model: db[process.env.DEFAULT_DB].models.Address, required: false 
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
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         
         console.log(JSON.parse(JSON.stringify(user.TenantUserRoles[0])));
         let updated = await db[process.env.DEFAULT_DB].models.TenantUserRole.update({
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
         // let currTntUsrRole = await db[process.env.DEFAULT_DB].models.TenantUserRole.findOne({
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