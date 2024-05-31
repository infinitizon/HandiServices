const axios = require('axios').default;
const AppError = require('../../../config/apiError');
// const helper = require('../../utils/helper');
// const { v4: uuidv4 } = require('uuid');

class PaystackService {  
   constructor ({ gatewayParams }) {
      this.headers = {
         Authorization: `Bearer ${gatewayParams?.business_secret || process.env.PAYSTACK_SECRETKEY}`,
         'Content-Type': 'application/json',
      }
   }
   async getBankList () {
      try {
         let response = await axios.request({
            url: `${process.env.PAYSTACK_BASE_URL}/bank`,
            method: 'GET',
            headers: this.headers
         });
         response.data.data = response.data.data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
         return {success: true, ...response.data, status: response.status};
      } catch (error) {
         return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
      }
   }
   async verifyNUBAN ({ nuban, bankCode }) {
      try {
         const response = await axios.request({
            url: `${process.env.PAYSTACK_BASE_URL}/bank/resolve?account_number=${nuban}&bank_code=${bankCode}`,
            method: 'GET',
            headers: this.headers
         });
         return {success: true, ...response.data, status: response.status};
      } catch (error) {
         return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
      }
   }
}

module.exports = PaystackService;