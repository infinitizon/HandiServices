const axios = require('axios').default;
const AppError = require('../../../config/apiError')

class PaystackService {  
   constructor ({ gatewayParams }) {
      this.headers = {
         Authorization: `Bearer ${gatewayParams?.business_secret || process.env.PAYSTACK_SECRETKEY}`,
         'Content-Type': 'application/json',
      }
   }
   // eslint-disable-next-line no-unused-vars
   async intitializeTransaction ({ user, amount, currency, callbackUrl, txRef, redirectUrl, gatewayParams, callbackParams }) {
      try {
         callbackUrl += `${callbackUrl.includes('?') ? '&' : '?' }redirectUrl=${redirectUrl}`;
         if (user && amount) {
         // generate transaction reference
         amount = parseInt(amount * 100);
   
         let data = {
            amount, currency,
            email: user?.email,
            // eslint-disable-next-line camelcase
            callback_url: callbackUrl,
            reference: txRef,
            metadata: callbackParams
         };
         if(gatewayParams?.subaccountId) data['subaccount'] = gatewayParams.subaccountId;
         if(gatewayParams?.channels) data['channels'] = gatewayParams.channels;
   
         let payload = JSON.stringify(data);
   
         const response = await axios.request({
            url: `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
            method: 'POST',
            headers: this.headers,
            // timeout: 4000,
            data: payload,
         });
   
         if (response.data.data && response.data.data.authorization_url) {
            response.data.status = 'success';
            response.data.data.link = response.data?.data?.authorization_url;
            return {success: true, status: response.status, data: response.data.data, message: response.data.message};
         } else {
            throw Error('Error generating payment link');
         }
   
         } else {
         throw Error('Payment parameters are not defined');
         }
      } catch (error) {
         console.error( 'Paystack Standard Payment Gateway Transaction error: ', error);
         return new AppError(error.response?.data?.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response?.status});
      }
   }
   async verifyTransaction ({  query }) {
      try {
         const response = await axios.request({
         url: `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${query.reference}`,
         method: 'GET',
         headers: this.headers,
         });
   
         return response.data?.data;
      } catch (error) {
         console.error('Paystack verify transaction error: ', error);
         return new AppError(error.response?.data?.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response?.status});
      }
   }
   
   async callback ({verified,  query})  {
      let { reference, redirectUrl, paymentType, saveCard } = query;
      if (verified) {
         redirectUrl = redirectUrl ? redirectUrl : process.env.BACKEND_BASE
         if (verified.status === 'success') {
               return { 
                  success: true, message: `${verified.status}: ${verified.gateway_response}`, amount: verified.requested_amount/100
                  , status: 'success'
                  , paymentType, gatewayRef: verified.id, txRef: verified.reference, redirectUrl, options: query
                  , saveCard
                  , card: {
                     first6Digits: verified.authorization.bin,
                     last4Digits: verified.authorization.last4,
                     issuer: verified.authorization.issuer,
                     country: verified.authorization.country_code,
                     brand: verified.authorization.brand.toLowerCase(),
                     channel: verified.authorization.channel,
                     authorizationCode: verified.authorization.authorization_code,
                     signature: verified.authorization.signature,
                     expiry: `${verified.authorization.exp_month}/${verified.authorization.exp_year}`,
                     accountName: verified.authorization.account_name,
                     reusable: verified.authorization.reusable,
                  }, verified 
               };
         } else {
               return { success: false, status: verified.status, message: (verified.message?verified.message:`Transaction ${verified.status}: ${verified.gateway_response}`), 
                  amount: verified.requested_amount/100, txRef: reference, card: verified.authorization, verified, redirectUrl, options: query };
         }
      } else {
         return { success: false, message: 'Payment could not be verified', 
               amount: null, txRef: reference, card: null, verified, redirectUrl: redirectUrl, options: query };
      }
   }
   async chargeTokenizedCard ({ email, amount, currency, authorization, txRef, gatewayParams, callbackParams })  {
      try {
         let data = {
            email, amount: parseInt(amount * 100),
               country: 'NG',
               currency: currency||'NGN',
               // eslint-disable-next-line camelcase
               authorization_code: authorization,
               reference: txRef,
               metadata: callbackParams
         };
         if(gatewayParams?.subaccountId) data['subaccount'] = gatewayParams?.subaccountId;
            
         const response = await axios.request({
               url: `${process.env.PAYSTACK_BASE_URL}/transaction/charge_authorization`,
               method: 'POST',
               data: JSON.stringify(data),
               headers: this.headers,
         });
         if(response.data.data && response.data.data?.status === 'success') {
            return {success: true, code:200, data: response.data.data, message: `${response.data.message}: ${response.data.data.gateway_response}`}
         }
         return {success: false, code:400, data: response.data.data, message: 'Error occured on the gateway'};
      } catch (error) {
         console.error(error)
         return new AppError(error.response?.data?.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response?.status});
      }
   }
   async createSubaccount ({ businessName, bankCode, accountNumber, split }) {
      const paystackData = {
         // eslint-disable-next-line camelcase
         business_name: businessName, bank_code: bankCode, account_number: accountNumber, percentage_charge: split,
      };
      try {
         const subaccountExists = await this.getSubaccount({ accountNumber });
         if(!subaccountExists && !subaccountExists.success)
            throw new AppError(subaccountExists?.message, subaccountExists.line||__line, subaccountExists.file||__path.basename(__filename), {status: subaccountExists?.status});

         let call = subaccountExists;
         if(Object.keys(subaccountExists.data).length <= 0){
            const account = await axios.post(
               process.env.PAYSTACK_BASE_URL + '/subaccount',
               paystackData,
               { headers: this.headers }
            );
            call = {success: account.data.status, ...account.data, status: account.status }
         }
         if (call.success) 
         // eslint-disable-next-line camelcase
         return { ...call, data: { subAccountCode: call.data.subaccount_code, metaId: call.data.id }, };
      } catch (error) {
         return new AppError(error.response?.data?.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response?.status});
      }
   }
   async getSubaccount ( criteria )  {
      try {
         const check = await axios.request({
               url: `${process.env.PAYSTACK_BASE_URL}/subaccount${criteria.subaccountCode?'/'+criteria.subaccountCode : ''}`,
               method: 'GET',
               headers: this.headers
         })
         if(check.data.status){
            let subaccount = check.data.data; 
            if(criteria.accountNumber) {
               subaccount = check.data.data.find(accounts => accounts.accountNumber === criteria.accountNumber )
            } 
            return {success: true, status: 200, message: 'Subaccount retrieved', data: subaccount||{}};
         }
         return { success: false, status: 400, data: null}
      } catch (error) {
         return new AppError(error.response?.data?.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response?.status});
      }
   }
   async updateSubaccount  ({ data, slug}) {
      try {
         return await axios.put(
            process.env.PAYSTACK_BASE_URL + '/subaccount/' + slug,
            data,
            { headers: this.headers }
         );
         
      } catch (error) {
         return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
      }
   }
   async getBankList () {
      try {
         const response = await axios.request({
               url: `${process.env.PAYSTACK_BASE_URL}/bank`,
               method: 'GET',
               headers: this.headers
         });
         response.data.banks = response.data.data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
         delete response.data.data;
         return {...response.data, success: response.data.status, status: response.status};
      } catch (error) {
         return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
      }
   }
   async verifyNUBAN ({ nuban, bankCode })  {
      try {
         const response = await axios.request({
            url: `${process.env.PAYSTACK_BASE_URL}/bank/resolve?account_number=${nuban}&bank_code=${bankCode}`,
            method: 'GET',
            headers: this.headers
         });
         return {success: true, status: response.status, data: { accountNumber: response.data.data.account_number, accountName: response.data.data.account_name}};
      } catch (error) {
         return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
      }
   }
}

module.exports = PaystackService;