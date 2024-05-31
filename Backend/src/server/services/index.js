
const TenantService = require('./tenant.service')
const UserService = require('./user.service')
const CustomerWalletService = require('./customer-wallet.service')
const PaymentService = require('./payment.service')
const RateLimitService = require('./rate-limit.service')
const OtpService = require('./otp.service')
const TransactionService = require('./transaction.service')
const AuditLogsService = require('./authLogs.service')
const EmailService = require('./email-builder.service');
const EmailBuilderService = require('./email-builder.service')
const AuthService = require('./auth.service');
const AddressService = require('./address.service');
const VerificationsService = require('./verifications.service');
const NotificationService = require('./notification.service');
const ProductService = require('./product.service');
const OrderService = require('./order.service');
const FeedbackService = require('./feedback.service');
const CloudObjUploadService = require('./cloud-obj-upload.service');
const ChatService = require('./chat.service');



module.exports = {
    TransactionService,
    TenantService,
    UserService,
    CustomerWalletService,
    PaymentService,
    RateLimitService,
    OtpService,
    EmailBuilderService,
    AuditLogsService,
    EmailService,
    AuthService,
    AddressService,
    VerificationsService,
    NotificationService,
    ProductService,
    OrderService,
    FeedbackService,
    CloudObjUploadService,
    ChatService,
}