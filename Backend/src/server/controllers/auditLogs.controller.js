const AppError = require('../../config/apiError');
const { AuditLogsService } = require('../services');
const { paginateOptions } = require('../utils/pagination');
const { successResponse } = require('../utils/responder');

class AuditLogsController {
   static getAllAuditLogs = async(req, res, next) => {
      try{
         const auth = res.locals.user
         const query = req.query
         const paginate = paginateOptions(req)
         const results = await AuditLogsService.getAllAuditLogs({ auth, query, paginate}, next)
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static getOneAuditLog = async(req, res, next) => {
      try{
         const auth = res.locals.user
         const {id} = req.params
         const results = await AuditLogsService.getOneAuditLog({id, auth}, next)
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static updateAuditLog = async(req, res, next) => {
      try{
         const auth = res.locals.user
         const {id} = req.params
         const data = req.body
         const results = await AuditLogsService.updateAuditLog({id, data, auth}, next)
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }
}
module.exports = AuditLogsController;
