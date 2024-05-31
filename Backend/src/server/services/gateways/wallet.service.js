
const { postgres } = require('../../../database/models');

const AppError = require('../../../config/apiError');
const helper = require('../../utils/helper');
// const FundsAppService = require('../../services/fundservice.service');
// const SavePlanService = require('../../services/saveplan.service');
// const TransactionService = require('../../services/transaction.service');
// const AccessBankService = require('../../services/gateways/accessbank.service');

class WalletService {
   // async callback ({verified, gateway_params, query, params, body}) {
   //    let { amount, redirect_url, reference, payment_type, ...options } = query;
   //    const redirectUrl = redirect_url ? redirect_url : process.env.BACKEND_BASE
   //    const wallet = await SavePlanService.getUserWallet({customer_id: verified.customer.id});
   //    if (wallet.success) {
   //       if (wallet.data.saveplan_users[0].total_paid < amount) 
   //          return { success: false, status: 'failed', message: "Wallet balance is insufficient", amount, gatewayRef: helper.generateOTCode(12, true), tx_ref: reference, card: null, verified, redirectUrl, options }
   //       try {
   //          let assetBank
   //          if(query.module==='invest') {
   //             // assetBank = await (new FundsAppService).getAssetBankGateway(query.asset_id)
   //          } else {
   //             // assetBank = await SavePlanService.getAssetBanks(query.asset_id, query.module);
   //          }
   //          if(!assetBank.success) throw new AppError('Error fetching asset bank. Please try again later', __line, __path.basename(__filename), {status: 400, show: true})
   //          const walletBank = await SavePlanService.getAssetBanks(wallet.data.id);
   //          if(!walletBank.success) throw new AppError('Error fetching wallet bank. Please try again later', __line, __path.basename(__filename), {status: 400, show: true})
            
   //          const walletTxnRef = helper.generateOTCode(20, true);
   //          const debitWallet = await TransactionService.postWalletTransaction({
   //             user: verified.customer, amount, description: verified.description, type: 'debit', currency: 'NGN' , wallet: wallet.data.saveplan_users[0]
   //             , source: 'wallet', gateway: 'wallet', module: query.module
   //             , reference: walletTxnRef, createTransaction: false, sendEmail: false
   //          });
   //          // Post the transaction immediately
   //          const accessBankService = await new AccessBankService({ url: process.env.ACCESS_AUTH_BASE, resource: process.env.ACCESS_CHDM_RESOURCE, client_id: process.env.ACCESS_CHDM_CLIENT_ID, client_secret: process.env.ACCESS_CHDM_CLIENT_SECRET});
   //          const paymentResponse = await accessBankService.transfer({
   //             amount, narration: verified.description, senderName: 'Invest Naija',
   //             beneficiaryAccount: assetBank.data[0].account_number, beneficiaryName: query.module, destinationBankCode: assetBank.data[0].bank_code,
   //             debitAccountNumber: walletBank.data[0].account_number, 
   //          })
   //          if (!paymentResponse || !paymentResponse.success) {
   //             await postgres.models.transaction.update(
   //                {
   //                   status: 'failed',
   //                   gateway_response: JSON.stringify(paymentResponse),
   //                },
   //                { where: { reference: walletTxnRef } }
   //             );
   //             const walletTxnRvsl = await TransactionService.postWalletTransaction({
   //                   user: verified.customer, amount, description: 'RVSL: '+verified.description, type: 'credit', currency: 'NGN', wallet: wallet.data.saveplan_users[0]
   //                   , source: 'wallet', gateway: 'wallet', module
   //                   , reference: walletTxnRef, createTransaction: false, sendEmail: false
   //             });
   //             throw new AppError('Error occurred while processing. Please try again later.', __line, __path.basename(__filename), { status: 400, show: true});
   //          }
   //          return { success: true, status: 'success', message: `Successful wallet funding`, amount, gatewayRef: helper.generateOTCode(12, true), tx_ref: reference, card: null, verified, redirectUrl, options };
   //       } catch (error) {
   //          return { success: false, status: 'failed', message: error.message, amount, gatewayRef: helper.generateOTCode(12, true), tx_ref: reference, card: null, verified: null, redirectUrl, options }
   //       }
   //    } else {
   //        return { success: false, status: 'failed', message: "We couldn't find your wallet, please contact your admin!", amount, gatewayRef: helper.generateOTCode(12, true), tx_ref: reference, card: null, verified: null, redirectUrl, options }
   //    }
   // }
   async verifyTransaction ({ query, }) {
      try {
         const { redirectUrl, reference, ...options } = query;
         const txn = await postgres.models.transaction.findOne({
            attributes: ['id', 'amount', 'description', 'reference'],
            include: [
               {model: postgres.models.customer, as: 'customer', attributes: ['id', 'bvn', 'phone', 'email']}
            ],
            where: {reference}
         });
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
module.exports = WalletService;