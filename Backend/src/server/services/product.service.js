const db = require("../../database/models");
const Pagination = require('../utils/pagination')
const CloudObjUploadService  = require('./cloud-obj-upload.service');
const AppError = require("../../config/apiError");

class ProductService {
   
   async getAsset ({productId, bankId, includes=[]}) {
      try {
         let criteria = {
            where: {id: productId},
            includes: []
         }
         if(bankId) criteria.where['commonId'] = bankId;
         if(includes.length > 0) {
            if(includes.includes('Media')) {
               criteria.includes.push({
                  model: db[process.env.DEFAULT_DB].models.Media,
                  attributes: ['id', 'name', 'link'], // Specify the attributes you want to include
              })
            }
         }
         const asset = await db[process.env.DEFAULT_DB].models.Product.findOne(criteria) || null;
         return { success: true, status: 200, message: `Product retrieved successfully`, data: asset }
      } catch (error) {
          return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   
   async updateAsset ({productId, changes, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const {Media, ...userChanges} = changes;
         const updatedAsset = await db[process.env.DEFAULT_DB].models.Product.findByPk( productId, {
            include: [{
               model: db[process.env.DEFAULT_DB].models.Media, where: {objectType: Media.objectType}, required: false }]
         });
         if (!updatedAsset) {
            throw new AppError(updatedAsset.message||'Product does not exist', updatedAsset.line||__line, updatedAsset.file||__path.basename(__filename), { status: updatedAsset.status||404, show: updatedAsset.show||true });
         }
         if(Media) {
            const media = updatedAsset.Media;
            if(media.length > 0) { // update
               await media[0].update(Media, { transaction: t });
            } else { // create
               await updatedAsset.createMedium(Media, { transaction: t });
            }
         }
         await updatedAsset.update(userChanges, { transaction: t });
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Product retrieved successfully`, data: updatedAsset }
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
   async createAsset ({body, creatorTnt, files, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      let uploadImage, uploaderService;
      try {
            
         body = {...body, ownedBy: creatorTnt};
         const product = await db[process.env.DEFAULT_DB].models.Product.create(
            {...body}, { transaction: t }
         );

         if(files && files?.image) {
            uploaderService = new CloudObjUploadService({service: 'cloudniary'});
            const uploadImage = await uploaderService.upload(files?.image?.tempFilePath);     
            if(uploadImage.secure_url) {
               // eslint-disable-next-line no-unused-vars
               const media = await product.createMedium({
                  commonType: 'product',
                  commonId: product.id,
                  name: uploadImage.original_filename,
                  type: uploadImage.format,
                  size: uploadImage.bytes,
                  response: uploadImage,
               }, { transaction: t });
            }
         }
         
         const newProduct = await db[process.env.DEFAULT_DB].models.Product.findOne({
            where: {id: product.id},
            include: [{
               model: db[process.env.DEFAULT_DB].models.Media,
               attributes: ['id', 'name', 'response'],
            }],
            transaction: t
         })
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Asset created successfully`, data: newProduct }
      } catch (error) {
         if(uploadImage && uploadImage.public_id) {
            await uploaderService.delete(uploadImage.public_id);
         }
         transaction ? 0 : await t.rollback();
         console.log(error.message);
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async createVendorCategory({tenantCategory, transaction}){
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const created = await db[process.env.DEFAULT_DB].models.TenantCategory.bulkCreate(tenantCategory, {transaction: t});
         if (!created) throw new AppError('Tenant Category  could not be added', __line, __path.basename(__filename), { status: 409, show: true });
      
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Tenant Category created successfully`, data: created }
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
   async createVendorProductPrice({vendorPrice, transaction}){
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const created = await db[process.env.DEFAULT_DB].models.ProductVendorCharacter.create(vendorPrice, {transaction: t});
         if (!created) throw new AppError('Vendor pricing could not be added', __line, __path.basename(__filename), { status: 409, show: true });
      
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Tenant Category created successfully`, data: created }
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
   async getAllVendorProductPrices({tenantId, params, query={} }){
      try {
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const xters = await db[process.env.DEFAULT_DB].models.ProductVendorCharacter.findAndCountAll({
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.ProductCharacter,
                  attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
               }
            ],
            where: {vendorId: tenantId, subCategoryId: params.subCategoryId},
            limit, offset,
         });         

         return { success: true, status: 200, message: `Characteristic fetched successfully`, count: xters?.count, data: xters?.rows }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getVendorProductPrice({id, where={},}){
      try {
         if(id) where = {...where, id};
         const found = await db[process.env.DEFAULT_DB].models.ProductVendorCharacter.findOne({
            include: [{model: db[process.env.DEFAULT_DB].models.ProductCharacter}],
            where
         });
      
         return { success: true, status: 200, message: `Price retrieved successfully`, data: found }
      } catch (error) {
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async createXter({xteristic, params, transaction}){
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const xterExists = await db[process.env.DEFAULT_DB].models.ProductCharacter.findOne({
            attributes: ['id'],
            where: { name: xteristic.name, productId: params.category_id },
         });
         if (xterExists) throw new AppError('Characteristic already defined for product', __line, __path.basename(__filename), { status: 409, show: true });
         
         const xter = await db[process.env.DEFAULT_DB].models.ProductCharacter.create({ ...xteristic, productId: params.category_id }, { transaction: t });

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Characteristic created successfully`, data: xter }
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
   async updateXter({oldXter, changes, transaction}){
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const updated = await oldXter.update(
            {...changes},
            { transaction: t });
         if (!updated) throw new AppError('Error updating characteristic', __line, __path.basename(__filename), { status: 409, show: true });
         
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Characteristic created successfully`, data: updated }
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.log(error.message);
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getXter({ id, query={} }){
      try {
         console.log(query);
         const xter = await db[process.env.DEFAULT_DB].models.ProductCharacter.findByPk(id, {
            attributes: ['id', 'name', 'type', 'misc', 'minPrice', 'maxPrice', 'createdAt'],
            include:[
               {model: db[process.env.DEFAULT_DB].models.Product, attributes: ['id', 'title']}
            ],
         });         

         return { success: true, status: 200, message: `Characteristic fetched successfully`, data: xter }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getAllXters({params={}, query={} }){
      try {
         let condition = {
            productWhere: {}
         }
         if(params && params.category_id) {
            condition.productWhere = { id: params.category_id }
         }
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const xters = await db[process.env.DEFAULT_DB].models.ProductCharacter.findAndCountAll({
            attributes: ['id', 'name', 'type', 'misc', 'minPrice', 'maxPrice', 'createdAt'],
            include:[
               {model: db[process.env.DEFAULT_DB].models.Product, attributes: ['id', 'title'], where: condition.productWhere}
            ],
            limit, offset,
         });         

         return { success: true, status: 200, message: `Characteristic fetched successfully`, count: xters?.count, data: xters?.rows }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async searchProductsWtTenantAndPrice({query}) {
      const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
      const { q } = query;
      const where = {
         [db.Sequelize.Op.or]: [
            {...(!isNaN(q) && {'$ProductVendorCharacter.price$' : { [db.Sequelize.Op.eq]: q } })},
            {'$Product.title$' : { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: `%${q}%` } },
            {'$Product.summary$' : { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: `%${q}%` } },
            {'$Product.description$' : { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: `%${q}%` } },
            {'$Tenant.name$' : { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: `%${q}%` } },
            {'$ProductCharacter.name$' : { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: `%${q}%` } },
         ],
      }
      try {
         const count = await db[process.env.DEFAULT_DB].models.ProductVendorCharacter.count({
            include: [
               { model: db[process.env.DEFAULT_DB].models.Product, attributes: [], where: {type: { [db.Sequelize.Op.ne]: 'category' } }, duplicating: false },
               { 
                  model: db[process.env.DEFAULT_DB].models.Tenant, attributes: [], duplicating: false,
               },
               { model: db[process.env.DEFAULT_DB].models.ProductCharacter, attributes: [], duplicating: false, }
            ],
            where
         })
         const products = await db[process.env.DEFAULT_DB].models.ProductVendorCharacter.findAll({
            attributes: ['id', 'price', [db.Sequelize.literal(`"Product"."title"`), 'product_title']],
            include: [
               { model: db[process.env.DEFAULT_DB].models.Product, attributes: ['id', 'summary', 'title', 'description'], where: {type: { [db.Sequelize.Op.ne]: 'category' } }, duplicating: false, },
               { 
                  model: db[process.env.DEFAULT_DB].models.Tenant, attributes: ['id', 'name', ], duplicating: false,
                  include: [
                     {model: db[process.env.DEFAULT_DB].models.Media, attributes: ['id', 'common_id', 'common_type', 'name', 'type', 'size', 'response', 'createdAt'], duplicating: false,}
                  ]
               },
               { model: db[process.env.DEFAULT_DB].models.ProductCharacter, attributes: ['id', 'name', 'type', 'min_price', 'max_price'], duplicating: false, }
            ],
            where,
            limit, offset
         })
         return { success: true, status: 200, message: `Data fetched successfully`, count, data: products }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getTenantsInSubCategoryByGeo({ params, query={} }) {
      try {
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         //Chosen answer -> https://stackoverflow.com/questions/37827468/find-the-nearest-location-by-latitude-and-longitude-in-postgresql
         // 7926.3352 or 3959 seemed to give miles
         // Claims 6,371 should give km but does not seem accurate
         // I chose to go with 7926.3352 for miles
         // `
         // select * from (
         // SELECT  *,( 7926.3352 * acos( cos( radians(6.537216) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(3.3685504) ) + sin( radians(6.537216) ) * sin( radians( lat ) ) ) ) AS distance 
         // FROM addresses
         // ) al
         // -- where distance < 5
         // ORDER BY distance
         // LIMIT 20;
         // `
         // Another one that looked even more accurate -> https://stackoverflow.com/questions/47619397/find-nearest-items-from-lat-lng-in-postgresql
         // `select * , ( point(lat, lng) <-> point(6.541994,3.3319645) )*111.325*1.60934 AS distance FROM addresses`
                    
         const vendors = await db[process.env.DEFAULT_DB].models.Tenant.findAll({
            // attributes: ['id', 'name', 'email', 'phone', [db.Sequelize.literal(`( point("Addresses"."lat", "Addresses"."lng") <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
            attributes: ['id', 'name', 'email', 'phone'],
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.Address,
                  attributes: [
                     'id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', 
                     // [db.Sequelize.literal(`(point(lat, lng) <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']
                     // [db.Sequelize.literal(`( 7926.3352 * acos( cos( radians(${query.lng}) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(${query.lat}) ) + sin( radians(${query.lng}) ) * sin( radians( lat ) ) ) )`), 'distance1'],
                     [db.Sequelize.literal(`ACOS( SIN(${query.lat}*PI()/180)*SIN(lat*PI()/180) + COS(${query.lat}*PI()/180)*COS(lat*PI()/180)*COS(lng*PI()/180-${query.lng}*PI()/180) ) * 6371`), 'distance']
                  ],
                  duplicating: false,
               },
               {
                  model: db[process.env.DEFAULT_DB].models.ProductVendorCharacter,
                  attributes: ['id'],
                  duplicating: false,
                  // eslint-disable-next-line camelcase
                  // through: {scope: {commonType: 'tenant'}},
                  where: { subCategoryId: params.subCategoryId }
               }
            ],
            where: {isEnabled: true, isLocked: false},
            // order: [["distance", 'DESC']],
            order: [[db.Sequelize.literal(`"Addresses.distance"`), 'ASC']],
            limit, offset,
         });      
         const count = await db[process.env.DEFAULT_DB].models.Tenant.count({
            // attributes: ['id', 'name', 'email', 'phone', [db.Sequelize.literal(`( point("Addresses"."lat", "Addresses"."lng") <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
            // attributes: [db.Sequelize.literal(`COUNT("Tenant"."id")`)],
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.ProductVendorCharacter,
                  attributes: [],
                  duplicating: false,
                  // eslint-disable-next-line camelcase
                  // through: {scope: {commonType: 'tenant'}},
                  where: { subCategoryId: params.subCategoryId }
               }
            ],
            where: {isEnabled: true, isLocked: false},
            group: [`Tenant.id`]
         });
         // column Addresses.commonType does not exist...I need to use direct queries to solve this
         
         return { success: true, status: 200, message: `Vendors fetched successfully`, count, data: vendors }
         // let qTntProducts = `
         //    SELECT {{fields}}
         //    FROM "tenants" t
         //       LEFT OUTER JOIN "addresses" a ON t."id" = a."common_id" AND (a."deleted_at" IS NULL AND a."common_type" = 'tenant') 
         //       INNER JOIN "product_vendor_xters" pvc ON t."id" = pvc."vendor_id" AND (pvc."deleted_at" IS NULL AND pvc."sub_category_id" = '${params.subCategoryId}')
         //    GROUP BY t.id,a."id"
         //    {{condition}}
         //    {{order}}
         //    {{pagination}}
         // `;
         // let qProducts = qTntProducts.replace(
         //    /{{fields}}/g,
         //    `t."id", t."name", t."email", t."phone", a."id" AS "Addresses.id", a."house_no" AS "Addresses.houseNo", a."address1" AS "Addresses.address1"
         //    , a."address2" AS "Addresses.address2", a."address3" AS "Addresses.address3", a."city" AS "Addresses.city", a."lga" AS "Addresses.lga"
         //    , a."country" AS "Addresses.country", a."state" AS "Addresses.state", a."lat" AS "Addresses.lat", a."lng" AS "Addresses.lng"
         //    , (point(lat, lng) <-> point(${query.lat},${query.lng}))*111.325*1.60934 AS "Addresses.distance"`
         // );
         // qProducts = qProducts.replace(/{{condition}}/g, '');

         // let countQuery = `SELECT COUNT(t.id) as count FROM (${qProducts}) t`;
         // countQuery = countQuery.replace(/{{order}}/g, '');
         // countQuery = countQuery.replace(/{{pagination}}/g, '');
         // const countResult = await db[process.env.DEFAULT_DB].query(countQuery, {
         //    type: db.Sequelize.QueryTypes.SELECT,
         // });
         
         // qProducts = qProducts.replace(/{{order}}/g, `ORDER BY "Addresses.distance" ASC`);
         // qProducts = qProducts.replace(/{{pagination}}/g, `OFFSET ${offset} LIMIT ${limit}`);
         // const rTntProducts = await db[process.env.DEFAULT_DB].query(qProducts, {
         //   nest: true,
         //   type: db.Sequelize.QueryTypes.SELECT,
         // });
         // return { success: true, status: 200, message: `Vendors fetched successfully`, count: countResult[0]?.count, data: rTntProducts }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   
   async getRecommendedVendors({ params, query={} }) {
      try {
         console.log(params);
         // const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const vendors = await db[process.env.DEFAULT_DB].models.Tenant.findAll({
            // attributes: ['id', 'name', 'email', 'phone', [db.Sequelize.literal(`( point("Addresses"."lat", "Addresses"."lng") <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
            attributes: ['id', 'name', 'email', 'summary', 'phone'],
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.Address,
                  ...((query.lat && query.lng) && {attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', 
                     [db.Sequelize.literal(`(point(lat, lng) <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']
                  ],}),
                  ...((!query.lat || !query.lng) && {attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', ]}),
                  duplicating: false,
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Media,
                  duplicating: false,
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Product,
                  // where: { pId: {[db.Sequelize.Op.ne]: null} },
                  duplicating: false,
               },
               // {
               //    model: db[process.env.DEFAULT_DB].models.ProductVendorCharacter,
               //    attributes: ['id'],
               //    duplicating: false,
               //    // eslint-disable-next-line camelcase
               //    // through: {scope: {commonType: 'tenant'}},
               //    where: { subCategoryId: params.subCategoryId }
               // }
            ],
            where: {isEnabled: true, isLocked: false, pId: {[db.Sequelize.Op.ne]: null} },
            // order: [["distance", 'DESC']],
            ...((query.lat && query.lng) && {order: [[db.Sequelize.literal(`"Addresses.distance"`), 'ASC']]}),
            ...((!query.lat || !query.lng) && {order: [db.Sequelize.literal(`RANDOM()`)]}),
            // limit: 4,
         });
         
         return { success: true, status: 200, message: `Vendors fetched successfully`, data: vendors }
      } catch (error) {
            console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
}

module.exports = ProductService;