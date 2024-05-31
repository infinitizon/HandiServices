const AppError = require('../../config/apiError');
// const PaymentService = require('../services/payment.service');
const HttpStatus = require('http-status');
const VerificationsService = require('../services/verifications.service');

class VerificationsController {
   static async verifyBVN (req, res, next) {
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
         let { bvn, dob,  firstname, lastname, refresh, } = req.body;

         const verificationsService = new VerificationsService({vendor: 'verifyme'});
         const verifyBVN = await verificationsService.verifyBVN({bvn, dob, firstname, lastname, refresh})
         // check if a valid response is provided
         if (!verifyBVN.success) throw new AppError(verifyBVN.message, __line, __path.basename(__filename), { status: HttpStatus.NOT_FOUND, show: true });
      
      
         res.status(verifyBVN.status).json(verifyBVN);
         res.locals.resp = verifyBVN;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }

   static async verifyNUBAN (req, res, next) {
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
         let { userId, nuban, bankCode, } =  req.body;
         let verifyNUBAN = await new VerificationsService({vendor: 'paystack'});
         const verified = await verifyNUBAN.verifyNUBAN({
            userId, nuban, bankCode,
         });
         // check if a valid response is provided
         if (!verified.success) throw new AppError(verified.message, verified.line||__line, verified.file||__path.basename(__filename), { status: verified.status||404, show: verified.show });
      
         res.status(verified.status).json(verified);
         res.locals.resp = verified;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }

   static async getBankList (req, res, next) {
      try {

         let verification = await new VerificationsService({vendor: 'paystack'});
         const bankResponse = await verification.getBankList({});
          if (!bankResponse || !bankResponse.success) {
            throw new AppError(bankResponse.message||'Banks not found', bankResponse.line||__line, bankResponse.file||__path.basename(__filename), {status: bankResponse.status||404});
          }
          res.status(bankResponse.status).json(bankResponse);
          res.locals.resp = bankResponse;
      } catch (error) {
          console.error(error.message);
          return next(
                  new AppError(
                      error.message
                      , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
              );
      }
  }
}
module.exports = VerificationsController;
