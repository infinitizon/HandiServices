const { postgres, Sequelize } = require("../../database/models");
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
                  model: postgres.models.Media,
                  attributes: ['id', 'name', 'link'], // Specify the attributes you want to include
              })
            }
         }
         const asset = await postgres.models.Product.findOne(criteria) || null;
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
      const t = transaction ?? await postgres.transaction()
      try {
         const {Media, ...userChanges} = changes;
         const updatedAsset = await postgres.models.Product.findByPk( productId, {
            include: [{
               model: postgres.models.Media, where: {objectType: Media.objectType}, required: false }]
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
      const t = transaction ?? await postgres.transaction()
      let uploadImage, uploaderService;
      try {
            
         body = {...body, ownedBy: creatorTnt};
         const product = await postgres.models.Product.create(
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
         
         const newProduct = await postgres.models.Product.findOne({
            where: {id: product.id},
            include: [{
               model: postgres.models.Media,
               attributes: ['id', 'name', 'link'],
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
      const t = transaction ?? await postgres.transaction()
      try {
         const created = await postgres.models.TenantCategory.bulkCreate(tenantCategory, {transaction: t});
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
      const t = transaction ?? await postgres.transaction()
      try {
         const created = await postgres.models.ProductVendorCharacter.create(vendorPrice, {transaction: t});
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
         const xters = await postgres.models.ProductVendorCharacter.findAndCountAll({
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            include: [
               {
                  model: postgres.models.ProductCharacter,
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
         const found = await postgres.models.ProductVendorCharacter.findOne({
            include: [{model: postgres.models.ProductCharacter}],
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
      const t = transaction ?? await postgres.transaction()
      try {
         const xterExists = await postgres.models.ProductCharacter.findOne({
            attributes: ['id'],
            where: { name: xteristic.name, productId: params.category_id },
         });
         if (xterExists) throw new AppError('Characteristic already defined for product', __line, __path.basename(__filename), { status: 409, show: true });
         
         const xter = await postgres.models.ProductCharacter.create({ ...xteristic, productId: params.category_id }, { transaction: t });

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
      const t = transaction ?? await postgres.transaction()
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
         const xter = await postgres.models.ProductCharacter.findByPk(id, {
            attributes: ['id', 'name', 'type', 'misc', 'minPrice', 'maxPrice', 'createdAt'],
            include:[
               {model: postgres.models.Product, attributes: ['id', 'title']}
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
         const xters = await postgres.models.ProductCharacter.findAndCountAll({
            attributes: ['id', 'name', 'type', 'misc', 'minPrice', 'maxPrice', 'createdAt'],
            include:[
               {model: postgres.models.Product, attributes: ['id', 'title'], where: condition.productWhere}
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
         [Sequelize.Op.or]: [
            {...(!isNaN(q) && {'$ProductVendorCharacter.price$' : { [Sequelize.Op.eq]: q } })},
            {'$Product.title$' : { [Sequelize.Op.iLike]: `%${q}%` } },
            {'$Product.summary$' : { [Sequelize.Op.iLike]: `%${q}%` } },
            {'$Product.description$' : { [Sequelize.Op.iLike]: `%${q}%` } },
            {'$Tenant.name$' : { [Sequelize.Op.iLike]: `%${q}%` } },
            {'$ProductCharacter.name$' : { [Sequelize.Op.iLike]: `%${q}%` } },
         ],
      }
      try {
         const count = await postgres.models.ProductVendorCharacter.count({
            include: [
               { model: postgres.models.Product, attributes: [], where: {type: { [Sequelize.Op.ne]: 'category' } }, duplicating: false },
               { 
                  model: postgres.models.Tenant, attributes: [], duplicating: false,
               },
               { model: postgres.models.ProductCharacter, attributes: [], duplicating: false, }
            ],
            where
         })
         const products = await postgres.models.ProductVendorCharacter.findAll({
            attributes: ['id', 'price', [Sequelize.literal(`"Product"."title"`), 'product_title']],
            include: [
               { model: postgres.models.Product, attributes: ['id', 'summary', 'title', 'description'], where: {type: { [Sequelize.Op.ne]: 'category' } }, duplicating: false, },
               { 
                  model: postgres.models.Tenant, attributes: ['id', 'name', ], duplicating: false,
                  include: [
                     {model: postgres.models.Media, attributes: ['id', 'common_id', 'common_type', 'name', 'type', 'size', 'response', 'createdAt'], duplicating: false,}
                  ]
               },
               { model: postgres.models.ProductCharacter, attributes: ['id', 'name', 'type', 'min_price', 'max_price'], duplicating: false, }
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
                    
         // const vendors = await postgres.models.Tenant.findAndCountAll({
         //    // attributes: ['id', 'name', 'email', 'phone', [Sequelize.literal(`( point("Addresses"."lat", "Addresses"."lng") <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
         //    attributes: ['id', 'name', 'email', 'phone'],
         //    include: [
         //       {
         //          model: postgres.models.Address,
         //          attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', [Sequelize.literal(`(point(lat, lng) <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
         //          duplicating: false,
         //       },
         //       {
         //          model: postgres.models.ProductVendorCharacter,
         //          attributes: ['id'],
         //          duplicating: false,
         //          // eslint-disable-next-line camelcase
         //          // through: {scope: {commonType: 'tenant'}},
         //          where: { subCategoryId: params.subCategoryId }
         //       }
         //    ],
         //    where: {isEnabled: true, isLocked: false},
         //    // order: [["distance", 'DESC']],
         //    order: [[Sequelize.literal(`"Addresses.distance"`), 'ASC']],
         //    limit, offset,
         // });
         // column Addresses.commonType does not exist...I need to use direct queries to solve this
         
         let qTntProducts = `
            SELECT {{fields}}
            FROM "tenants" t
               LEFT OUTER JOIN "addresses" a ON t."id" = a."common_id" AND (a."deleted_at" IS NULL AND a."common_type" = 'tenant') 
               INNER JOIN "product_vendor_xters" pvc ON t."id" = pvc."vendor_id" AND (pvc."deleted_at" IS NULL AND pvc."sub_category_id" = '${params.subCategoryId}')
            GROUP BY t.id,a."id"
            {{condition}}
            {{order}}
            {{pagination}}
         `;
         let qProducts = qTntProducts.replace(
            /{{fields}}/g,
            `t."id", t."name", t."email", t."phone", a."id" AS "Addresses.id", a."house_no" AS "Addresses.houseNo", a."address1" AS "Addresses.address1"
            , a."address2" AS "Addresses.address2", a."address3" AS "Addresses.address3", a."city" AS "Addresses.city", a."lga" AS "Addresses.lga"
            , a."country" AS "Addresses.country", a."state" AS "Addresses.state", a."lat" AS "Addresses.lat", a."lng" AS "Addresses.lng"
            , (point(lat, lng) <-> point(${query.lat},${query.lng}))*111.325*1.60934 AS "Addresses.distance"`
         );
         qProducts = qProducts.replace(/{{condition}}/g, '');

         let countQuery = `SELECT COUNT(t.id) as count FROM (${qProducts}) t`;
         countQuery = countQuery.replace(/{{order}}/g, '');
         countQuery = countQuery.replace(/{{pagination}}/g, '');
         const countResult = await postgres.query(countQuery, {
            type: Sequelize.QueryTypes.SELECT,
         });
         
         qProducts = qProducts.replace(/{{order}}/g, `ORDER BY "Addresses.distance" ASC`);
         qProducts = qProducts.replace(/{{pagination}}/g, `OFFSET ${offset} LIMIT ${limit}`);
         const rTntProducts = await postgres.query(qProducts, {
           nest: true,
           type: Sequelize.QueryTypes.SELECT,
         });
         return { success: true, status: 200, message: `Vendors fetched successfully`, count: countResult[0]?.count, data: rTntProducts }
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
         // const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const vendors = await postgres.models.Tenant.findAll({
            // attributes: ['id', 'name', 'email', 'phone', [Sequelize.literal(`( point("Addresses"."lat", "Addresses"."lng") <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']],
            attributes: ['id', 'name', 'email', 'summary', 'phone'],
            include: [
               {
                  model: postgres.models.Address,
                  ...((query.lat && query.lng) && {attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', 
                     [Sequelize.literal(`(point(lat, lng) <-> point(${query.lat},${query.lng}) )*111.325*1.60934`), 'distance']
                  ],}),
                  ...((!query.lat || !query.lng) && {attributes: ['id', 'houseNo', 'address1', 'address2', 'address3', 'city', 'lga', 'country', 'state', 'lat', 'lng', ]}),
                  duplicating: false,
               },
               {
                  model: postgres.models.Media,
                  duplicating: false,
               },
               {
                  model: postgres.models.Product,
                  // where: { pId: {[Sequelize.Op.ne]: null} },
                  duplicating: false,
               },
               // {
               //    model: postgres.models.ProductVendorCharacter,
               //    attributes: ['id'],
               //    duplicating: false,
               //    // eslint-disable-next-line camelcase
               //    // through: {scope: {commonType: 'tenant'}},
               //    where: { subCategoryId: params.subCategoryId }
               // }
            ],
            where: {isEnabled: true, isLocked: false, pId: {[Sequelize.Op.ne]: null} },
            // order: [["distance", 'DESC']],
            ...((query.lat && query.lng) && {order: [[Sequelize.literal(`"Addresses.distance"`), 'ASC']]}),
            ...((!query.lat || !query.lng) && {order: [Sequelize.literal(`RANDOM()`)]}),
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