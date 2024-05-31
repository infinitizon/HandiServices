const AppError = require('../../config/apiError');
const ReportsService = require('../services/reports.service');

class ReportsController {
   static valueByCurrency = async (req, res, next) => {
      /**
       * #swagger.description = 'To verify BVN with DoB'
       * #swagger.parameters['obj'] = {
              in: 'body',
              description: 'Enter BVN and DoB',
              schema: {
                  $bvn: '22211124253',
                  $dob: '22-10-1990'
              }
          }'
       */
      try {
         const { userId, tenantId } = res.locals.user;

         const reportsService = new ReportsService({});
         const report = await reportsService.valueByCurrency({user_id: userId||req.query.userId })
         // check if a valid response is provided
         if (!report.success) throw new AppError(report.message, report.line||__line, report.file||__path.basename(__filename), { status: report.status||404, show: report.show });
      
      
         res.status(report.status).json(report);
         res.locals.resp = report;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   };

   static valueByAsset = async (req, res, next) => {
      /**
       * #swagger.description = 'To verify BVN with DoB'
       * #swagger.parameters['obj'] = {
              in: 'body',
              description: 'Enter BVN and DoB',
              schema: {
                  $bvn: '22211124253',
                  $dob: '22-10-1990'
              }
          }'
       */
      try {
         const { currency } = req.query;
         const { userId, tenantId } = res.locals.user;

         const reportsService = new ReportsService({});
         const report = await reportsService.valueByAsset({user_id: userId||req.query.userId, currency })
         // check if a valid response is provided
         if (!report.success) throw new AppError(report.message, report.line||__line, report.file||__path.basename(__filename), { status: report.status||404, show: report.show });
      
      
         res.status(report.status).json(report);
         res.locals.resp = report;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   };

   static valueByCustomer = async (req, res, next) => {
      /**
       * #swagger.description = 'To verify BVN with DoB'
       * #swagger.parameters['obj'] = {
              in: 'body',
              description: 'Enter BVN and DoB',
              schema: {
                  $bvn: '22211124253',
                  $dob: '22-10-1990'
              }
          }'
       */
      try {
         const { currency } = req.query;
         const { userId, tenantId } = res.locals.user;

         const reportsService = new ReportsService({});
         const report = await reportsService.valueByCustomer({user_id: req.query.userId, currency })
         // check if a valid response is provided
         if (!report.success) throw new AppError(report.message, report.line||__line, report.file||__path.basename(__filename), { status: report.status||404, show: report.show });
      
      
         res.status(report.status).json(report);
         res.locals.resp = report;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   };
}
module.exports = ReportsController;
