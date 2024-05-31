const axios = require('axios').default;
const AppError = require('../../../config/apiError');

class FlutterwaveService {
    getHeaders (businessSecret = null) {
        return {
            'Authorization': `Bearer ${businessSecret || process.env.FLUTTERWAVE_SECRET}`
        }
    }
    postHeaders (businessSecret = null) { 
        return {
        'Authorization': `Bearer ${ businessSecret || process.env.FLUTTERWAVE_SECRET}`,
        'Content-Type': 'application/json'
        }
    }
    async intitializeTransaction ({user, amount, callbackUrl, redirectUrl = "", txRef, gatewayParams, callbackParams }) {
        try {
            // eslint-disable-next-line camelcase
            let data = {amount, redirectUrl: callbackUrl, payment_options: 'card', currency: "NGN", txRef, meta: callbackParams ?? {}}
            data.customer = {
                email: user.email,
                phonenumber: user.phone,
                name: user.firstName + ' ' + user.lastName,
            }
            data.customizations = {
                title: "HandiServices",
                description: "HandiServices",
                logo: process.env.BACKEND_BASE + "/emailTemplates/assets/logo.png"
            }
            if (gatewayParams.subAccountId) {
                data.subaccounts = [{
                    id: gatewayParams.subAccountId,
                }]
            }
            data.meta['redirect_url'] = redirectUrl;
            
            let payload = JSON.stringify(data);
            const response = await axios.request({
                url: 'https://api.flutterwave.com/v3/payments',
                method: 'POST',
                headers: this.postHeaders(gatewayParams?.business_secret),
                data: payload
            })
    
            
            if (response.data.data && response.data.data.link) {
                return {success: true, status: response.status, data: response.data.data, message: response.data.message};
            } else {
                throw Error('Error generating payment link');
            }
        } catch (error) {
            console.error( 'Flutterwave Standard Payment Gateway Transaction error: ', error);
            return {success: false, status: error.response?.status || 500, message: error.response?.data?.message ?? error.message };
        }
    }
    async verifyTransaction ({ gatewayParams, query }) {
        try {
            const response = await axios.request({
                url: query.transactionId
                        ? `https://api.flutterwave.com/v3/transactions/${query.transactionId}/verify`
                        : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${query.txRef}`,
                method: 'GET',
                headers: this.getHeaders(gatewayParams?.businessSecret)
            })
            return response.data.data;
        } catch (error) {
            return new AppError(error.response?.data?.message ?? error.message, error.line||__line, error.file||__path.basename(__filename), { status: error.response.status});
        }
    }
    callback ({verified, query}) {
        let { txRef, paymentType } = query;
        if (verified && verified.status) {
            // eslint-disable-next-line camelcase
            let {redirect_url, saveCard} = verified.meta
            // eslint-disable-next-line camelcase
            redirect_url = redirect_url ? redirect_url : process.env.BACKEND_BASE
            // eslint-disable-next-line camelcase
            let redirectUrl = new URL(redirect_url.includes("?") ? redirect_url : redirect_url.replace(/&/, '?'));
            const options = Object.fromEntries(new URLSearchParams(redirectUrl.search));
            if (verified.status === 'successful') {
                return { 
                        success: true, message: (verified.message?verified.message:`Transaction ${verified.status}: ${verified.processor_response}`)
                        , status: 'success'
                        , amount: verified.amount, paymentType, gatewayRef: verified.id, txRef: verified.tx_ref, redirectUrl: redirectUrl.href.split('?')[0]
                        , saveCard
                        , card: {
                            first6Digits: verified.card.first_6digits,
                            last4Digits: verified.card.last_4digits,
                            issuer: verified.card.issuer,
                            country: verified.card.country,
                            brand: verified.card.type.toLowerCase(),
                            // channel: verified.payment_type,
                            channel: verified.card.channel,
                            authorizationCode: verified.card.token || verified.card.authorization_code,
                            signature: verified.card.token || verified.card.authorization_code,
                            expiry: verified.card.expiry,
                            accountName: verified.card.account_name,
                            reusable: verified.card.reusable,
                        }, verified, options
                    };
            } else {
                return { success: false, status: verified.status, message: (verified.message?verified.message:`Transaction ${verified.status}: ${verified.processor_response}`), 
                    amount: (verified.amount?verified.amount:null), txRef, card: (verified.card ? verified.card : null), 
                    verified, redirectUrl: redirectUrl.href.split('?')[0], options };
            }
        } else {
            if(txRef) {
                return { success: false, status: 'failed', message: 'Payment could not be verified', 
                    amount: 0, txRef, card: null, verified,  options: query };
            } else throw Error('Payment could not be verified. Please contact admin');
        }
    }
    async listBanks () {
        try {
            const response = await axios.request({
                url: 'https://api.flutterwave.com/v3/banks/NG',
                method: 'GET',
                headers: this.getHeaders()
            });
            response.data.banks = response.data.data.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            delete response.data.data;
            return response.data;
        } catch (error) {
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async verifyAccount ({nuban, bankCode}) {
        try {
            let data = {
                // eslint-disable-next-line camelcase
                account_number: nuban,
                // eslint-disable-next-line camelcase
                account_bank: bankCode
            }
            let payload = JSON.stringify(data);
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/accounts/resolve`,
                method: 'POST',
                headers: this.postHeaders(),
                data: payload
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async createRecipient (user) {
        try {
            let data = JSON.stringify(user)
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/beneficiaries`,
                method: 'POST',
                headers: this.postHeaders(),
                data
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async deleteRecipient (recipientCode) {
        try {
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/beneficiaries/${recipientCode}`,
                method: 'DELETE',
                headers: this.getHeaders()
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async verifyBVN (bvn) {
        try {
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/kyc/bvns/${bvn}`,
                method: 'GET',
                headers: this.getHeaders()
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async initializeWithdrawal (data) {
        try {
            let post = JSON.stringify(data)
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/transfers`,
                method: 'POST',
                headers: this.postHeaders(),
                data: post
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return new AppError(error.response.data.message, error.line||__line, error.file||__path.basename(__filename), {status: error.response.status});
        }
    }
    async chargeTokenizedCard (options) {
        try {
            let data = {
                amount: options.amount,
                country: 'NG',
                currency: 'NGN',
                token: options.auth,
                // eslint-disable-next-line camelcase
                tx_ref: options.txRef,
                email: options.email,
                meta: options.callbackParams ?? {}
            };
            if(options.gatewayParams?.subAccountId) data['subaccount'] = options.gatewayParams?.subAccountId;
            let payload = JSON.stringify(data);
    
            const response = await axios.request({
                url: `https://api.flutterwave.com/v3/tokenized-charges`,
                method: 'POST',
                data: payload,
                headers: this.postHeaders(options.gateway_params?.business_secret),
            });
    
            if(response.data.data && response.data?.status === 'success') {
                return {code:200, success: true, data: response.data.data, message: `${response.data.message}: ${response.data.data.processor_response}`}
            }
            return {success: false, code:400, data: response.data, message: 'Error occured on the gateway'};
        } catch (error) {
            console.error(error)
            return {success: false, code: error.response?.status, message: error.response?.data?.message};
        }
    }
    async createSubaccount ({data})  {
        const flutterData = {
            // eslint-disable-next-line camelcase
            account_bank: data.bankCode,
            // eslint-disable-next-line camelcase
            account_number: data.accountNumber,
            // eslint-disable-next-line camelcase
            business_name: data.businessName,
            // eslint-disable-next-line camelcase
            business_mobile: process.env.PHONE,
            // eslint-disable-next-line camelcase
            split_value: data.split,
            // eslint-disable-next-line camelcase
            split_type: 'percentage',
            // eslint-disable-next-line camelcase
            business_email: data.email ?? 'integrations@chapelhilldenham.com',
            country: 'Nigeria',
          };
        try {
            const subaccountExists = await this.getSubaccount({accountNumber: data.account_number, businessSecret: data.business_secret});
            if(subaccountExists.success) {
                const result = subaccountExists.data.find(obj => obj['account_number'] === data.account_number);
                if(result){
                    return {success: true, message: 'Success', data: {subAccountCode: result.subaccount_id, metaId: result.id}}
                }  
            }
            const call = await axios.post(
                'https://api.flutterwave.com/v3/subaccounts',
                flutterData,
                { headers: this.postHeaders(data?.businessSecret) }
            );
            if(call.data.status === 'success'){
                return {success: true, message: 'Success', data: {subAccountCode: call.data.data.subaccount_id, metaId: call.data.data.id}}
            }
            return {success: false, message: 'Failed creating sub_account'}
        } catch (error) {
            return {success: false, message: error.response?.data?.message || error.message}
        }
    }
    async getSubaccount (criteria) {
        try {
            const keys = Object.keys(criteria);
            let params = '';
            for(const key of keys) {
                // eslint-disable-next-line no-unused-vars
                params += `${key}=${criteria[key]}`;
            }
            const check = await axios.request({
                url: `https://api.flutterwave.com/v3/subaccounts`,
                method: 'GET',
                headers: this.getHeaders(criteria?.businessSecret)
            })
            if(check.data.status === 'success'){
                return {success: true, code: 200, message: check.data.message, data: check.data.data}
            }
            return { success: true, code: 400, data: check}
        } catch (error) {
            return {success: false, code: error.response?.status, message: error.response?.data?.message || error.message}
        }
    }
    async deleteSubaccount (data){
        try {
            const call = await axios.delete(
                'https://api.flutterwave.com/v3/subaccounts/'+data.id,
                { headers: this.postHeaders(data?.businessSecret) }
            );
            if(call.data.status === 'success'){
                return {success: true, message: call.data.message}
            }
            return {success: false, message: 'Failed to delete subaccount on flutterwave'}
        } catch (error) {
            return {success: false, message: error.response?.data?.message || error.message}
        }
    }
}
module.exports = FlutterwaveService;