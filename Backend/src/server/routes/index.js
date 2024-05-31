const ThirdpartyRoutes = require('./3rdParty.routes')
const authRoutes = require('./auth.routes')
const testRoutes = require('./test.routes')
const transactionRoutes = require('./transaction.route')
const UserRoutes = require('./user.route')
const ReportRoutes = require('./report.routes')
const verificationRouter = require('./verification.routes')
const auditLogsRoutes = require('./auditLogs.route')


module.exports = {
    ThirdpartyRoutes,
    authRoutes,
    testRoutes,
    transactionRoutes,
    UserRoutes,
    ReportRoutes,
    verificationRouter,
    auditLogsRoutes
}