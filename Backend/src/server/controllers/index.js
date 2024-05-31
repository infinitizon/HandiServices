const TestController = require("./test.controller")
const TransactionController = require("./transaction.controller")
const UserController = require("./user.controller")
const AuthController = require("./auth.controller")
const VerificationController = require("./verification.controller")
const AuditLogsController = require('./auditLogs.controller')
const ReportsController = require('./reports.controller')
const ReportController = require('./report.controller')
const ChatController = require('./chat.controller')

module.exports = {
    TestController,
    TransactionController,
    UserController,
    VerificationController,
    AuthController,
    AuditLogsController,
    ReportsController,
    ReportController,
    ChatController,
}