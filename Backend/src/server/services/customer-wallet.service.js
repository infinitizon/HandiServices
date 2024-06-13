
const AppError = require("../../config/apiError");
const db = require("../../database/models");

class CustomerWalletService {
   async createWallet ({ userId, currency='NGN', isEnabled=true, isLocked=false, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const wallet = await db[process.env.DEFAULT_DB].models.Wallet.create({
            userId, currency, total: 0, isEnabled, isLocked
         }, { transaction: t });

         transaction ? 0 : await t.commit();
         return wallet;
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }

   async getWallet ({ userId, currency='NGN', isEnabled=true, isLocked=false }) {
      try {
         const walletProduct = await db[process.env.DEFAULT_DB].models.Product.findOne({
            attributes: ['id'],
            where: {type: '103'}, // id for wallet product
         });
         const wallet = await db[process.env.DEFAULT_DB].models.Wallet.findOne({
            where: {userId, currency, isEnabled, isLocked}
         })
         if(!wallet)
            throw new AppError(`Customer has no wallet`, __line, __path.basename(__filename), { status: 404, show: true });
         // return { success: true, status: 200, data: wallet, message: 'Wallet retrieved successfully'};
         return { success: true, status: 200, data: {...JSON.parse(JSON.stringify(wallet)), assetId: walletProduct.id},  message: 'Wallet retrieved successfully'};
      } catch (error) {
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }

   async updateBalance ({ userId, currency='NGN', amount, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const wallet = await db[process.env.DEFAULT_DB].models.Wallet.findOne({
            where: {userId, currency }
         })
         if(!wallet)
            throw new AppError(`Customer has not found`, __line, __path.basename(__filename), { status: 404, show: true });
         
         await wallet.update({total: wallet.total + amount}, { transaction: t });
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, data: wallet,  message: 'Wallet updated successfully'};
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }

}

module.exports = CustomerWalletService;