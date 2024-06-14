const AppError = require('../../config/apiError');
const DBEnums = require('../../database/db-enums');
const HttpStatus = require('http-status');

class LOVController {
   static async getNOKRelationships (req, res, next) {
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
         // return next(new AppError('Primary Offer is currently closed', 400));
         const resp = {
            success: true,
            status: HttpStatus.OK,
            message: `LOVs fetched successfully`,
            data: DBEnums.NOKRelationships
         };
      
      
         res.status(resp.status).json(resp);
         res.locals.resp = resp;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
}
module.exports = LOVController;
