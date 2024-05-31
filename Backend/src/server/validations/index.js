const AddressValidator = require('./address.validation');
const AssetValidator = require('./asset.validation');
const AuthValidator = require('./auth.validation');
const ErrorValidator = require('./error.validations');
const FeedbackValidator = require('./feedback.validation');
const OrderValidator = require('./order.validation');
const PaymentValidator = require('./payment.validation');
const ProductValidator = require('./product.validation');
const TenantValidator = require('./tenant.validation');
const TxnsValidator = require('./txns.validation');
const VerificationsValidator = require('./verifications.validation');



module.exports = {
   AddressValidator,
   AssetValidator,
   AuthValidator,
   ErrorValidator,
   FeedbackValidator,
   OrderValidator,
   PaymentValidator,
   ProductValidator,
   TenantValidator,
   TxnsValidator,
   VerificationsValidator
}