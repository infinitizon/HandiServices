const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const AuthController = require('../controllers/auth.controller')
const ProductController = require('../controllers/product.controller')
const JoiMW = require('../middleware/validate');
const ProductValidator = require('../validations/product.validation');
const AuthValidator = require('../validations/auth.validation');
const TenantValidator = require('../validations/tenant.validation');
const AssetValidator = require('../validations/asset.validation');
const UploadMiddleware = require('../middleware/upload.middleware')
const TenantController = require('../controllers/admin/tenant.controller')

router.route('/users')
      .post( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN']), UploadMiddleware.construct, JoiMW.validateReq(AuthValidator.createUser),AdminController.createUsers )
      .get( AuthController.authenticate, AuthController.authorize(['PROVIDER', 'PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.getUsers );
router.patch( '/user/:userId/account', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.addAccounts )
router.route('/user/:user_id')
      .get( AuthController.authenticate, AuthController.authorize(['PROVIDER', 'PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.getUser )
      .patch( AuthController.authenticate, AuthController.authorize(['PROVIDER', 'PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.updateUser )
      .delete( AuthController.authenticate, AuthController.authorize(['PROVIDER', 'PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.deleteUser );

/**
 *  Order Routes
 */

router.patch('/order/:orderId/status', AuthController.authenticate, AuthController.authorize(['CUSTOMER','PROVIDER_ADMIN','SUPER_ADMIN']), AdminController.updateStatus);
/**
 *  Product Routes
 */
router.route('/products/:type?/:categoryId?')
      // Create a new asset
      .post( JoiMW.validateReq(AssetValidator.createAsset), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.createAsset)
      .get( AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.getAllProducts)
router.route('/products/:productId')
      // Update a specific asset
      .patch( JoiMW.validateReq(AssetValidator.updateAsset), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.updateAsset)
      // Delete a specific asset
      // .delete( AuthController.authenticate,  AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), AssetController.deleteAsset);
router.route('/product/xteristics')
      // Create a new asset
      .get( ProductController.getAllXters)
router.route('/product/:category_id/xteristics')
      // Create a new asset
      .post( JoiMW.validateReq(ProductValidator.createXter), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.createXter)
      .get( ProductController.getAllXters)
router.route('/product/xteristics/:id')
      // Update a specific asset
      .patch( JoiMW.validateReq(ProductValidator.updateXter), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.updateXter)
      // Delete a specific asset
      // .delete( AuthController.authenticate,  AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), AssetController.deleteAsset);
// AssetBanks Routes
router.route('/products/:productId/banks')
      .post( AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), JoiMW.validateReq(AssetValidator.addAssetBank), ProductController.addAssetBanks)
      .put( AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.updateAssetBanks)
      .get( AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.getAssetBanks);
router.route('/products/:asset_id/banks/:bank_id/gateways')
      // .post( AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), JoiMW.validateReq(AssetValidator.addAssetBankGateways), ProductController.addAssetBankGateways)

router.delete('/products/:asset_id/banks/:id', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.deleteAssetBank);

router.route('/vendors')
      .post( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), UploadMiddleware.construct, JoiMW.validateReq(TenantValidator.createTenant), TenantController.createTenants )
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'CUSTOMER', 'PROVIDER_ADMIN']), TenantController.getTenants );
router.route('/vendors/category')
      .post( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), ProductController.createVendorCategory )
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), TenantController.getTenants );
router.route('/vendors/product-price/:subCategoryId?')
      .post( JoiMW.validateReq(ProductValidator.createProductPrice), AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), ProductController.createVendorProductPrice )
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), ProductController.getAllVendorProductPrices );
router.route('/vendor/orders/:tenantId?')
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), TenantController.getTenantOrders )
router.route('/vendor/orders/:orderId/details')
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), TenantController.getTenantOrderDetails )
router.route('/vendor/:tenantId?')
      .patch( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), UploadMiddleware.construct, JoiMW.validateReq(TenantValidator.updateTenant), TenantController.updateTenant )
      .get( AuthController.authenticate, AuthController.authorize(['SUPER_ADMIN', 'PROVIDER_ADMIN']), TenantController.getTenant )
router.get('/vendors/types', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), TenantController.getTenantTypes)
router.get('/vendors/templates', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN', 'SUPER_ADMIN']), AdminController.downloadTemplates)

module.exports = router;
