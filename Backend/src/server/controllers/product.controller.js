const db = require('../../database/models');
const genericRepo = require('../../repository');
const AppError = require('../../config/apiError')
const { ProductService, CloudObjUploadService, AuthService, } = require('../services')

const { Op } = require('sequelize'); // Import Sequelize's Op for filter conditions


class ProductController {

   static async createAsset(req, res, next) {
      /* #swagger.description = 'Create a new product.' */
      /* #swagger.parameters['Product'] = {
         in: 'body',
         description: 'Create a new product with provided details.',
         required: true,
         type: 'object',
         schema: { $ref: '#/components/schemas/createAsset' }
      } */
      /* #swagger.responses[201] = {
         description: 'The created product.',
         schema: { $ref: '#/components/schemas/Product' }
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         let { tenantId, } = res.locals.user;
         let { pId, ...body} = req.body; // { type, title, metaTitle, sku, summary, description, price }

         const assetService = new ProductService;
         if(pId) {
            const parProd = await assetService.getAsset({productId: pId})
            if (!parProd || !parProd.success || !parProd.data) 
               throw new AppError(parProd.show?parProd.message:`Product with specified parent Id does not exist`, parProd.line||__line, parProd.file||__path.basename(__filename), { status: parProd.status||404, show: parProd.show||true });
            body.pId = pId;
         }
         const product = await assetService.createAsset({body, ownedBy: tenantId, files: req.files, transaction: t});
         if (!product || !product.success) 
            throw new AppError(product.show?product.message:`Error occured while creating product`, product.line||__line, product.file||__path.basename(__filename), { status: product.status||404, show: product.show||true });

         await t.commit();
         
         res.status(product.status).json(product);
      } catch (error) {
         t.rollback();
         console.log(error?.message);
         return next(
               new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error?.name, status: error.status??500, show: error?.show})
         );
      }
   }
   
   static async getAsset(req, res, next) {
      /* #swagger.description = 'Get a specific product by ID.' */
      /* #swagger.parameters['asset_id'] = {
         in: 'path',
         description: 'The ID of the product to retrieve.',
         required: true,
         type: 'string'
      } */
      /* #swagger.responses[200] = {
         description: 'The requested product.',
         schema: { $ref: '#/components/schemas/Product' }
      } */
      /* #swagger.responses[404] = {
         description: 'Product not found.'
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         const productId = req.params.asset_id;
         const assetService = new ProductService;
         const product = await assetService.getAsset({ productId })
         if (!product || !product.success) 
         throw new AppError(product.show?product.message:`Error occured while creating product`, product.line||__line, product.file||__path.basename(__filename), { status: product.status||404, show: product.show||true });

         res.status(200).json(product);
      } catch (error) {
         console.log(error.message);
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
   
   static async updateAsset(req, res, next) {
      /* #swagger.description = 'Update a specific product by ID.' */
      /* #swagger.parameters['asset_id'] = {
         in: 'path',
         description: 'The ID of the product to update.',
         required: true,
         type: 'string'
      } */
      /* #swagger.parameters['Product'] = {
         in: 'body',
         description: 'Update the details of a specific product.',
         required: true,
         type: 'object',
         schema: { $ref: '#/components/schemas/createAsset' }
      } */
      /* #swagger.responses[200] = {
         description: 'The updated product.',
         schema: { $ref: '#/components/schemas/Product' }
      } */
      /* #swagger.responses[404] = {
         description: 'Product not found.'
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      let uploaded;
      const uploaderService = new CloudObjUploadService({service: 'cloudinary'});
      try {
         const productId = req.params.productId;
         let {...data } = req.body;
         let { image } = req.files;
         
         if(image) {
            uploaded = await uploaderService.upload(image);
            if(!uploaded || !uploaded.success)
               throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
               data = {...data, Media: {
               name: image.name,
               type: image.mimetype,
               size: image.size,
               objectType: 'product-image',
               response: uploaded.data
            }}
         }
         const assetService =  new ProductService;
         const updated = await assetService.updateAsset({productId, changes: data,});
         if (!updated || !updated.success)
            throw new AppError(updated.message||'Error updating the product', updated.line||__line, updated.file||__path.basename(__filename), { status: updated.status||404, show: updated.show||true });

         res.status(updated.status).json(updated);
      } catch (error) {
         if(uploaded) {
            await uploaderService.delete({ id: uploaded.id });
         }
         console.log(error.message);
         return next(
               new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   
   /***
    * 
    * Putting admin only functions here
    */
    
   static async addAssetBanks (req, res, next) {
      /**
          * #swagger.description = 'Create Offer Banks'
          * #swagger.responses[200] = {
             description: 'Offer Bank Added',
            schema: {
               $status: 200,
               $success: true,
               $message: 'RefCodes retrieved successfully',
               $data: {
                        $account_number: "1710497164",
                        $bank: {
                           $code: "044",
                           $name: "Access Bank"
                        },
                        $email: "agoodey@chapelhilldenham.com",
                        $name_on_account: "INVESTIN LIMITED-PLANIN",
                        $split: "1",
                        $transaction_type: "DR",
                        $gateways: [
                           { 
                           $name: "paystack",
                           $type: "card"
                           },
                           {
                              $name: "gtsquad",
                              $type: "card",
                              $sub_account_id: "jkwbefiuy87y78y7843y87y87tyughjbrebe344"
                           }
                        ]
                  
               },
            }
         }
         * #swagger.responses[404] = {
               description: 'No user found'
            }
         * #swagger.responses[500] = {
               description: 'Server error'
            }
         */
      let t = await db[process.env.DEFAULT_DB].transaction();
      // let bulkCreate = [];
      try {
         // const { productId } = req.params;
         // // const { userId, tenantId } = res.locals.user;
         // let parent_id = req?.query?.parent_id;
         // const { gateways, acct_type, transaction_type, split, name_on_account, account_number, bank, email } = req.body
         // const { code, name, slug } = bank;
         // const bank_code = code,
         //       bank_name = name,
         //       businessName = name_on_account;

         // const assetService = new AssetService();
         // let product = await assetService.getAsset({productId});
         // if (!product || !product.success) 
         //    throw new AppError(product.message||'Product not found', product.line||__line, product.file||__path.basename(__filename), { status: product.status||400, show: product.show });
         
         // const available = await product.data.getAssetBanks({
         //    where: { account_number, bank_code },
         // });
         // if (available.length > 0) throw new AppError('Account already exist on product', __line, __path.basename(__filename), { status: 400, show: true });

         // let assetBank = await assetService.createAssetBank({
         //    productId, bankName: name, nameOnAccount: name_on_account, accountNumber: account_number, 
         //    businessName, transactionType: transaction_type, bankCode: code,
         //    transaction: t
         // });

         await t.commit();
         res.status(200).send({});
      } catch (error) {
         console.error(error);
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
   static async createVendorCategory(req, res, next) {
      /* #swagger.tags = ['Character'] */
      try {
         let auth = res.locals?.user;
         let { subCategories } = req.body;
         const tenantCategory = subCategories.map(productId=>{
            return {productId, tenantId: auth.tenantId };
         })
         const productService = new ProductService;
         const xter = await productService.createVendorCategory({tenantCategory});
         if(!xter || !xter.success)
            throw new AppError(xter.show?xter.message:`Error creating characteristic`, xter.line||__line, xter.file||__path.basename(__filename), { status: xter.status||500 });

         res.status(xter.status).json(xter);
      } catch (error) {
         console.log(error.message);
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
   static async createVendorProductPrice(req, res, next) {
      /* #swagger.tags = ['Character'] */
      const t = await db[process.env.DEFAULT_DB].transaction()
      try {
         let auth = res.locals?.user;
         let { prices } = req.body;
         let { subCategoryId } = req.params;
         const productService = new ProductService;
         let createdPrices = []
         for (let vendorPrice of prices) {
            const found = await productService.getVendorProductPrice({where: {subCategoryId, prodXterId: vendorPrice.characteristic, vendorId: auth.tenantId}});
            if(!found || !found.success)
               throw new AppError(found.show?found.message:`Error creating characteristic`, found.line||__line, found.file||__path.basename(__filename), { status: found.status||500 });
            if(found && found.success && found.data && found.data?.price ==vendorPrice.price)
               throw new AppError(`You have already created ${found.data?.ProductCharacter.name}`, found.line||__line, found.file||__path.basename(__filename), { status: found.status||500 });

            vendorPrice = {...vendorPrice, subCategoryId, vendorId: auth.tenantId, prodXterId: vendorPrice.characteristic}
            const xter = await productService.createVendorProductPrice({vendorPrice, transaction: t});
            if(!xter || !xter.success)
               throw new AppError(xter.show?xter.message:`Error creating characteristic`, xter.line||__line, xter.file||__path.basename(__filename), { status: xter.status||500 });

            createdPrices.push(xter.data)
         }

         await t.commit();
         res.status(201).json({ success: true, status: 201, message: `Tenant Category created successfully`, data: createdPrices });
      } catch (error) {
         await t.rollback();
         console.log(error.message);
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
   static async getAllVendorProductPrices(req, res, next) {
      /* #swagger.tags = ['Character'] */
      try {
         let auth = res.locals?.user;
         const tenantId = auth?.role === 'SUPER_ADMIN' ? req.query.tenantId : auth.tenantId;
         const productService = new ProductService;
         const xters = await productService.getAllVendorProductPrices({tenantId, params: req.params, query: req.query});
         if(!xters || !xters.success)
            throw new AppError(xters.show?xters.message:`Error fetching characteristic`, xters.line||__line, xters.file||__path.basename(__filename), { status: xters.status||500 });

         res.status(xters.status).json(xters);
      } catch (error) {
         console.log(error.message);
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
   static async createXter(req, res, next) {
      /* #swagger.tags = ['Character'] */
      try {
         const productService = new ProductService;
         const xter = await productService.createXter({xteristic: req.body, params: req.params,});
         if(!xter || !xter.success)
            throw new AppError(xter.show?xter.message:`Error creating characteristic`, xter.line||__line, xter.file||__path.basename(__filename), { status: xter.status||500 });

         res.status(xter.status).json(xter);
      } catch (error) {
         console.log(error.message);
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
   static async updateXter(req, res, next) {
      /* #swagger.tags = ['Character'] */
      try {
         const { id } = req.params;
         const productService = new ProductService;
         const xter = await productService.getXter({id});
         if(!xter || !xter.success)
            throw new AppError(xter.show?xter.message:`Error fetching characteristic with specified ID`, xter.line||__line, xter.file||__path.basename(__filename), { status: xter.status||500 });

         const updated = await productService.updateXter({oldXter: xter.data, changes: req.body});
         if(!updated || !updated.success)
            throw new AppError(updated.show?updated.message:`Error updating characteristic`, updated.line||__line, updated.file||__path.basename(__filename), { status: updated.status||500 });

         res.status(updated.status).json(updated);
      } catch (error) {
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
   static async getAllXters(req, res, next) {
      /* #swagger.tags = ['Character'] */
      try {
         const productService = new ProductService;
         const xters = await productService.getAllXters({params: req.params, query: req.query});
         if(!xters || !xters.success)
            throw new AppError(xters.show?xters.message:`Error fetching characteristic`, xters.line||__line, xters.file||__path.basename(__filename), { status: xters.status||500 });

         res.status(xters.status).json(xters);
      } catch (error) {
         console.log(error.message);
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
   static async getAllProducts(req, res, next) {
      /* #swagger.tags = ['Products'] */
      /* #swagger.description = 'Get all products with optional filters.' */
      /* #swagger.parameters['openingDate'] = {
         in: 'query',
         description: 'Filter by openingDate (format: YYYY-MM-DD).',
         required: false,
         type: 'string',
         format: 'date'
      } */
      /* #swagger.parameters['closingDate'] = {
         in: 'query',
         description: 'Filter by closingDate (format: YYYY-MM-DD).',
         required: false,
         type: 'string',
         format: 'date'
      } */
      /* #swagger.parameters['name'] = {
         in: 'query',
         description: 'Filter by product name (partial match).',
         required: false,
         type: 'string'
      } */
      /* #swagger.parameters['tenant_id'] = {
         in: 'query',
         description: 'Filter by tenant ID.',
         required: false,
         type: 'string'
      } */
      /* #swagger.parameters['currency'] = {
         in: 'query',
         description: 'Filter by currency code.',
         required: false,
         type: 'string'
      } */
      /* #swagger.parameters['description'] = {
         in: 'query',
         description: 'Filter by product description (partial match).',
         required: false,
         type: 'string'
      } */
      /* #swagger.responses[200] = {
         description: 'A list of products.',
         schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         const { type, categoryId } = req.params;
         
         let auth = res.locals?.user;

         // Extract an array of tenant IDs from userTenants
         // const tenantIds = userTenants.map(userTenant => userTenant.tenant_id);
         let filter = {}; let category;
         if(categoryId) {
            filter = {pId: categoryId };
            category = await db[process.env.DEFAULT_DB].models.Product.findByPk(categoryId, {
               attributes: ['id', 'type','title']
            })
         } else if (type) {
            filter = {type: Object.keys(db[process.env.DEFAULT_DB].models.Product.ProductType).find(k=>db[process.env.DEFAULT_DB].models.Product.ProductType[k]===type)}
         }
         // Define a filter object based on provided query parameters
         const productFilter = {
            where: filter,
            include: [{model: db[process.env.DEFAULT_DB].models.Media}]
         };
         // if(auth?.role && auth?.role =='PROVIDER_ADMIN') {
            productFilter.include.push({
               model: db[process.env.DEFAULT_DB].models.Tenant,
               ...((!auth?.role && !req.query.tenantId) && {attributes: []}),
               through: { attributes: [] }, 
               ...((auth?.role && auth?.role =='PROVIDER_ADMIN') && {include: [{model: db[process.env.DEFAULT_DB].models.Address}]}),
               where: {...(((auth?.role && auth?.role =='PROVIDER_ADMIN') || (!auth && req.query.tenantId)) && {id: auth?.tenantId || req.query.tenantId})},
               ...((!auth?.role && !req.query.tenantId) && {required: false}),
            })
         // }
   
         // Remove undefined properties from the filter object
         Object.keys(productFilter.where).forEach((key) =>
            productFilter.where[key] === undefined && delete productFilter.where[key]
         );
   
         // Find products based on the filter
         const products = await db[process.env.DEFAULT_DB].models.Product.findAll({
            ...((!auth?.role && !req.query.tenantId) && {attributes: ["id", "pId", "type", "title", "summary", "createdAt", [db.Sequelize.literal(`COUNT("Tenants"."id")`), "totalVendors"] ]}),
            where: productFilter.where,
            include: productFilter.include,
            ...((!auth?.role && !req.query.tenantId) && {group: [`Product.id`, `Media.id`],}),
         })
         let resp = {
            status: 200, success: true, message: `Products fetched successfully`, category, data: products,
         }
         res.status(resp.status).json(resp);
      } catch (error) {
         console.log(error.message);
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
   static async searchProductsWtTenantAndPrice(req, res, next) {
      
      try {
         // Find products based on the filter
         const productService = new ProductService;
         const search = await productService.searchProductsWtTenantAndPrice({query: req.query});
         if(!search || !search.success)
            throw new AppError(search.show?search.message:`Error searching catalog. Please try again later`, search.line||__line, search.file||__path.basename(__filename), { status: search.status||500 });
         res.status(search.status).json(search);
      } catch (error) {
         console.log(error.message);
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
   static async getProduct(req, res, next) {
      /* #swagger.description = 'Get a specific product by ID.' */
      /* #swagger.parameters['product_id'] = {
         in: 'path',
         description: 'The ID of the product to retrieve.',
         required: true,
         type: 'string'
      } */
      /* #swagger.responses[200] = {
         description: 'The requested product.',
         schema: { $ref: '#/components/schemas/Product' }
      } */
      /* #swagger.responses[404] = {
         description: 'Product not found.'
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         const productId = req.params.productId;
         const product = await genericRepo.setOptions('Product', {
               condition: {id: productId},
               inclussions: [{
                  model: db[process.env.DEFAULT_DB].models.Media,
                  attributes: ['id', 'name', 'link'], // Specify the attributes you want to include
               }],
         }).findOne();
   
         if (!product) {
               return res.status(404).json({ message: 'Product not found' });
         }
   
         res.status(200).json(product);
      } catch (error) {
         console.log(error.message);
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
   
   static async updateProduct(req, res, next) {
      /* #swagger.description = 'Update a specific product by ID.' */
      /* #swagger.parameters['product_id'] = {
         in: 'path',
         description: 'The ID of the product to update.',
         required: true,
         type: 'string'
      } */
      /* #swagger.parameters['Product'] = {
         in: 'body',
         description: 'Update the details of a specific product.',
         required: true,
         type: 'object',
         schema: { $ref: '#/components/schemas/createProduct' }
      } */
      /* #swagger.responses[200] = {
         description: 'The updated product.',
         schema: { $ref: '#/components/schemas/Product' }
      } */
      /* #swagger.responses[404] = {
         description: 'Product not found.'
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         const productId = req.params.productId;
         const {...data } = req.body;
         
         const product = await genericRepo.setOptions('Product', {
               condition: {id: productId}
         }).findOne();

         if (!product) {
               throw new AppError('Product does not exist', __line, __path.basename(__filename), { status: 404 });
         }

         const updatedProduct = await genericRepo.setOptions('Product', {
               changes: data,
               returning: true,
               condition: {id: product?.id }
            }).update();

         res.status(200).json(updatedProduct[1][0]);
      } catch (error) {
         console.log(error.message);
         return next(
               new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }

   static async deleteProduct(req, res, next) {
      /* #swagger.description = 'Delete a specific product by ID.' */
      /* #swagger.parameters['product_id'] = {
         in: 'path',
         description: 'The ID of the product to delete.',
         required: true,
         type: 'string'
      } */
      /* #swagger.responses[204] = {
         description: 'Product deleted successfully.'
      } */
      /* #swagger.responses[404] = {
         description: 'Product not found.'
      } */
      /* #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         const assetId = req.params.assetId;
         const product = await genericRepo.setOptions('Product', {
               condition: {id: assetId}
         }).findOne();

         if (!product) {
               throw new AppError('Product does not exist', __line, __path.basename(__filename), { status: 404 });
         }

         // Delete the product
         // eslint-disable-next-line no-underscore-dangle
         await genericRepo.setOptions('Product', {
               condition: { id: product.id },
            })._delete();

         res.status(204).send();
      } catch (error) {
         console.log(error.message);
         return next(
               new AppError(
                  error.message
                  , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }

   static async getProductsForUser(req, res, next) {
      /* #swagger.description = 'Get products for a user.' 
         #swagger.responses[200] = {
         description: 'Successful response with products.',
         schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
      } 
      #swagger.responses[400] = {
         description: 'Bad request, invalid input data.'
      } 
      #swagger.responses[401] = {
         description: 'Unauthorized, user not authenticated.'
      } 
      #swagger.responses[404] = {
         description: 'User not found or no products found for the user.'
      } 
      #swagger.responses[500] = {
         description: 'Internal server error.'
      } */
      try {
         let { userId } = res.locals.user;
   
         // Find the user's tenant by joining TenantUserRole and Tenant models
         const userTenants = await genericRepo.setOptions('TenantUserRole', {
               condition: { userId },
               inclussions: [{
                  model: db[process.env.DEFAULT_DB].models.Tenant,
                  attributes: ['id','name']
               }],
         }).findAll();

         // Extract an array of tenant IDs from userTenants
         const tenantIds = userTenants.map(userTenant => userTenant.tenant_id);

         // Define a filter object to fetch products based on tenant or null tenant_id
         const productFilter = {
         where: {
            [Op.or]: [
               { tenantId: { [Op.in]: tenantIds } }, // Check if tenantId is in the array of tenantIds
               { tenantId: null },
            ],
         },
         include: [{
            model: db[process.env.DEFAULT_DB].models.Media,
            attributes: ['id', 'name', 'link'],
         }],
         };
   
         // Remove undefined properties from the filter object
         Object.keys(productFilter.where).forEach((key) =>
         productFilter.where[key] === undefined && delete productFilter.where[key]
         );
   
         // Fetch products based on the filter
         const products = await genericRepo.setOptions('Product',{ condition: productFilter.where, inclussions: productFilter.include}).findAll();
   
         res.status(200).json(products);
      } catch (error) {
         console.log(error.message);
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
   static async getTenantsInSubCategoryByGeo(req, res, next) {
      try {
         // let auth = res.locals.user;
         const productService = new ProductService;
         const tenants = await productService.getTenantsInSubCategoryByGeo({ params: req.params, query: req.query });
         if (!tenants || !tenants.success)
            throw new AppError(tenants.show?tenants.message:`Error fetching tenants`, tenants.line||__line, tenants.file||__path.basename(__filename), { status: tenants.status||404, show: tenants.show });

         res.status(tenants.status).json(tenants);
      } catch (error) {
         console.log(error.message);
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
   static async getTenantProdXteristics(req, res, next) {
      try {
         let auth = res.locals.user;
         if(!auth) {
            auth = req.headers['authorization'];
            let role = req.headers['role']
            if (!auth || role != 'CUSTOMER') throw new AppError('You need to login as a customer to continue', __line, __path.basename(__filename), { status: 402, show: true });
            if (auth && auth.startsWith('Bearer ')) {
                auth = auth.slice('7', auth.length);
            }
            const authorized = await AuthService.verifyToken(auth, process.env.ACCESS_TOKEN_SECRET);
            if(!authorized.success) throw new AppError('Authentication invalid/Expired. Please login again', __line, __path.basename(__filename), { status: 402, show: true });
            
            auth = {role, ...authorized.data};
         }
         const params = req.params;
         const query = req.query;

         const productService = new ProductService;
         const xteristic = await productService.getAllVendorProductPrices({ tenantId: params.tenantId, params, query });
         if (!xteristic || !xteristic.success)
            throw new AppError(xteristic.show?xteristic.message:`Error fetching Characteristics`, xteristic.line||__line, xteristic.file||__path.basename(__filename), { status: xteristic.status||404, show: xteristic.show });

         res.status(xteristic.status).json(xteristic);
      } catch (error) {
         console.log(error.message);
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

module.exports = ProductController;
