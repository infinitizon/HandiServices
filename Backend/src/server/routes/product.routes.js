const express = require('express');
const router = express.Router();
const JoiMW = require('../middleware/validate');
const ProductController = require('../controllers/product.controller');
const AuthController = require('../controllers/auth.controller');
const ProductValidator = require('../validations/asset.validation');

// Define the route for fetching assets by user
// router.get('/user',  AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN']), ProductController.getProductsForUser);

router.get('/search', JoiMW.validateReq(ProductValidator.searchProductsWtTenantAndPrice), ProductController.searchProductsWtTenantAndPrice)
router.get('/:subCategoryId/tenants', JoiMW.validateReq(ProductValidator.getTenantsInSubCategoryByGeo), ProductController.getTenantsInSubCategoryByGeo);
router.get('/tenant/:tenantId/:subCategoryId/characteristics', ProductController.getTenantProdXteristics);
//route for fetching all assets for admin and tenants using query
router.get('/:type?/:categoryId?', ProductController.getAllProducts)

// Retrieve a specific asset
router.get('/:assetId', AuthController.authenticate, ProductController.getProduct);

// Update a specific asset
router.put('/:assetId', JoiMW.validateReq(ProductValidator.updateProduct), AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.updateProduct);

// Delete a specific asset
router.delete('/:assetId',AuthController.authenticate,  AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.deleteProduct);

//route for fetching all assets for admin and tenants using query
router.get('/', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN','SUPER_ADMIN']), ProductController.getAllProducts);



module.exports = router;
