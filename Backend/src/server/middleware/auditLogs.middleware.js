const httpStatus = require("http-status")
const { abortIf } = require("../utils/responder")
const genericRepo = require("../../repository")

const AuditLogs = (action) => async (req, res, next) => {
    try{
        // instantiate Audit Logs
        const {userId, tenantId} = res.locals.user
        genericRepo.setOptions('AuditLogs', {
            data: {
                maker: userId,
                url: req.originalUrl,
                action,
              }
        })
        req.audit = {
          id: createLogs.id,
          maker: req.body.user_id
        }
        next()
      }catch(e){
        abortIf(e, httpStatus.FORBIDDEN, 'Failed to '+action)
      }
}

module.exports = {
    AuditLogs
}