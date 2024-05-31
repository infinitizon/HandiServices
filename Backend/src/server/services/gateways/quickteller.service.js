const axios = require('axios').default;
const AppError = require('../../../config/apiError');

class QuicktellerService {
    formUrlEncoded (obj){
        return Object.keys(obj).reduce((p, c) => p + `&${c}=${encodeURIComponent(obj[c])}`, '')
    }
    constructor ({ gatewayParams, grantType='client_credentials' }) {
        return (async () => {
            if(!gatewayParams) return this;
            const response = await axios.request({
                method: 'POST',
                url: process.env.QUICKTELLER_AUTH_URL,
                data: this.formUrlEncoded({ grantType }),
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${gatewayParams.business_secret}`
                }
            })
            this.header = { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${response.data.access_token}`
            };
            return this; // Return the newly-created instance
        })();
    }
    // eslint-disable-next-line no-unused-vars
    async intitializeTransaction  ({ user, amount, currency, callbackUrl, redirectUrl, txRef, gatewayParams, callbackParams }) {
        try {
            if (user && amount) {
                amount = parseInt(amount * 100);
                // const qs = '?' + new URLSearchParams(callback_params).toString()
                callbackUrl += `${callbackUrl.includes('?') ? '&' : '?' }redirect_url=${redirectUrl}`;

                let data = {
                    merchantCode: 'VNA',
                    payableCode: "103",
                    amount, currencyCode: '566', 
                    redirectUrl: callbackUrl,
                    customerId:  user?.id || user?.email,
                    customerEmail: user?.email,
                    transactionReference: txRef,
                };
                // if(subaccountId) data['subaccount'] = subaccountId;
                let payload = JSON.stringify(data);

                const response = await axios.request({
                    url: `${process.env.QUICKTELLER_BASE_URL}/paymentgateway/api/v1/paybill`,
                    method: 'POST',
                    headers: this.header,
                    data: payload,
                });

                if (response.data && response.data.paymentUrl) {
                    response.data.status = 'success';
                    response.data.link = response.data?.paymentUrl;
                    return {success: true, status: response.status, data: response.data, message: response.data.message||'Payment link created. You will be redirected shortly. Please wait...'};
                } else {
                    throw Error('Error generating payment link');
                }

            } else {
                throw Error('Payment parameters are not defined');
            }
        } catch (error) {
            console.error( 'Quickteller Payment Gateway error: ', error);
            return {success: false, status: error.response?.status || 500, message: error.response.statusText??error.response.data.message ?? error.message };
        }
    }
    // eslint-disable-next-line no-unused-vars
    async verifyTransaction ({ gatewayParams, query, params, body }) {
        try {
            const response = await axios.request({
                url: `${process.env.QUICKTELLER_BASE_URL}/collections/api/v2/gettransaction.json?transactionReference=${body.txnref}`,
                method: 'GET',
                headers: this.header
            })
            return response.data
        } catch (error) {
            return new AppError(error.response?.data?.message ?? error.message, error.line||__line, error.file||__path.basename(__filename), error.response.status);
        }
    }
    callback ({verified,  query,  body}) {
        let { txnref, paymentType } = body;
        if (verified) {
            let {redirectUrl,  ...options} = query;
            verified.id = verified?.RetrievalReferenceNumber
            redirectUrl = redirectUrl ? redirectUrl : process.env.BACKEND_BASE
            if (verified.ResponseCode=='00') {
                return { 
                    success: true, message: `Transaction ${verified.ResponseDescription}`, paymentType, txRef: verified.MerchantReference
                    , status: 'success'
                    , amount: verified.Amount/100, gatewayRef: verified.MerchantReference, redirectUrl: redirectUrl
                    , saveCard: 'false'
                    , card: {
                        first6Digits: verified?.CardNumber?.slice(0, 6),
                        last4Digits: verified?.CardNumber?.slice(-4),
                        issuer: verified?.issuer,
                        country: verified?.country,
                        brand: verified?.type,
                        channel: verified?.Channel,
                        authorizationCode: verified?.token || verified?.authorization_code,
                        signature: verified?.token || verified?.authorization_code,
                        expiry: verified?.expiry,
                        accountName: verified?.account_name,
                        reusable: verified?.reusable,
                    }, verified, options
                };
            } else {
                return { success: false, status: verified.ResponseDescription, message: `Transaction ${verified.ResponseDescription}`, 
                    amount: verified.Amount/100, txRef: verified.MerchantReference, card: (verified.card ? verified.card : null), 
                    verified: verified, redirectUrl, options };
            }
        } else {
            if(txnref) {
                return { success: false, status: 'failed', message: 'Payment could not be verified', 
                    amount: 0, txnref, card: null, verified, options: query };
            } else throw Error('Payment could not be verified. Please contact admin');
        }
    }
    static createSubaccount (data)  {
        return {
            success: true, 
            message: 'Subaccount created successfully', 
            data: { subAccountCode: data.subAccountId, metaId: null }
        }
    }
}

module.exports = QuicktellerService;