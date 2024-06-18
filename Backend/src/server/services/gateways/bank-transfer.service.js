
const db = require('../../../database/models');

const AppError = require('../../../config/apiError');
const helper = require('../../utils/helper');
const genericRepo = require('../../../repository');
const jwt = require('jsonwebtoken');

class BankTransferService {
   // eslint-disable-next-line no-unused-vars
   async intitializeTransaction ({ user, amount, currency, callbackUrl, txRef, description, redirectUrl, gatewayParams, callbackParams }) {
      try {
         const paymentData={
            link: callbackUrl + '?redirectUrl=' + redirectUrl + '&amount=' + amount + '&reference=' + txRef
         }
         const TxnHeader = await db[process.env.DEFAULT_DB].models.TxnHeader.findOne({where: {reference: txRef}})
         if(!TxnHeader)
            return new AppError(`Transaction not found`, __line, __path.basename(__filename), { status: 404, show: true});
         
         await TxnHeader.createMedium({
            commonType: 'txn_headers',
            commonId: TxnHeader.id,
            name: callbackParams?.image?.original_filename,
            type: callbackParams?.image?.format,
            link: callbackParams?.image?.secure_url,
            size: callbackParams?.image?.bytes,
         });
         await TxnHeader.createAuditLog({
            maker: user.id,
            url: callbackParams?.image?.secure_url,
            action: 'bankTransfer',
            tenantId: TxnHeader.tenantId,
            commonType: 'txn_headers',
            commonId: TxnHeader.id
         });
         return { success: true, status: 'success', data: paymentData, message: `Successful wallet payment` };

      } catch (error) {
         return new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show, data: error.data }
         );
      }
   }
   callback ({verified, headers, query}) {
      let { amount, redirectUrl, reference } = query;
      redirectUrl = redirectUrl ?? process.env.BACKEND_BASE

      let auth = headers['authorization'];
      if (auth) {
         const authorized = jwt.verify(auth, process.env.ACCESS_TOKEN_SECRET);
         if (['investment', 'learning', 'admin', 'lord'].includes(authorized.role)) {
               // eslint-disable-next-line no-undef
               req.user = authorized;
         }
         return { success: true, status: 201, message: `Transaction verified`, 
               amount, gatewayRef: helper.generateOTCode(12, true), txRef: reference, card: null, 
               verified, redirectUrl, options: query 
         };
      } else {
         const verified = {};
         return { success: true, status: 'pending_approval', message: `Transaction will be completed once payment is verified`, 
               amount, txRef: reference, card: null, 
               verified, redirectUrl, options: query 
         };
      }        
   }
   async verifyTransaction  ({ query}) {
      try {
         const { redirectUrl, reference, ...options } = query;
         const txn = await genericRepo.setOptions('TxnHeader', {
            selectOptions: ['id', 'amount', 'description', 'reference'],
            condition: {reference},
            inclussions: [
               {
                  model: db[process.env.DEFAULT_DB].models.User,
                  attributes: ['id', 'bvn', 'phone', 'email' ]
               }
            ]
         }).findOne()
         // const txn = await db[process.env.DEFAULT_DB].models.transaction.findOne({
         //    attributes: ['id', 'amount', 'description', 'reference'],
         //    include: [
         //       {model: db[process.env.DEFAULT_DB].models.customer, as: 'customer', attributes: ['id', 'bvn', 'phone', 'email']}
         //    ],
         //    where: {reference}
         // });
         if(!txn) 
            return { 
               success: false, 
               status: 'failed', 
               message: 'Transaction could not be found', 
               amount: options.amount, 
               gatewayRef: helper.generateOTCode(12, true), 
               txRef: reference, 
               card: null, 
               verified: null, 
               redirectUrl,
               options 
            };
         if(txn.amount != options.amount) throw Error(`Amount is not valid => ${reference}`);
         return JSON.parse(JSON.stringify(txn));
      } catch (error) {
         return new AppError(error.response?.data?.message ?? error.message, error.line||__line, error.file||__path.basename(__filename), { status: error.response.status});
      }
   }
}
module.exports = BankTransferService;