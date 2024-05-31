const axios = require('axios').default;
const AppError = require('../../../config/apiError');

class GTSquadService {
    getHeaders (key) {
        return {Authorization: `Bearer ${key}`}
    }
      
    postHeaders(key){ 
        return {
            // Authorization: `Bearer ${process.env.GTBANKSQUAD_SECRETKEY}`,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        }
    }
    async intitializeTransaction ({ user, amount, currency, callbackUrl, redirectUrl, txRef, gatewayParams, callbackParams }) {
        try {
            if(!gatewayParams.businessSecret) return new AppError('No key specified for gateway', __line, __path.basename(__filename), {show: true});
            if (user && amount) {
                amount = parseInt(amount * 100);

                let data = {
                    amount, currency, callbackUrl,
                    email: user?.email,
                    // eslint-disable-next-line camelcase
                    initiate_type: "inline",
                    // eslint-disable-next-line camelcase
                    transaction_ref: txRef,
                    // eslint-disable-next-line camelcase
                    pass_charge: true,
                    metadata: callbackParams ?? {}
                };
                if(gatewayParams?.channels) data['payment_channels'] = gatewayParams.channels;
                data.metadata['redirect_url'] = redirectUrl;

                const response = await axios.request({
                    url: `${process.env.GTBANKSQUAD_BASE_URL}/transaction/initiate`,
                    method: 'POST',
                    headers: this.postHeaders(gatewayParams.businessSecret),
                    timeout: 4000,
                    data: JSON.stringify(data),
                });

                if (response.data.data && response.data.data.checkout_url) {
                    response.data.status = 'success';
                    response.data.data.link = response.data?.data?.checkout_url;
                    return {success: true, status: response.status, data: response.data.data, message: response.data.message};
                } else {
                    throw new AppError('Error generating payment link', __line, __path.basename(__filename), { show: true });
                }

            } else {
                throw new AppError('Payment parameters are not defined', __line, __path.basename(__filename), { show: true });
            }
        } catch (error) {
            console.error( 'GTBank Squad Payment Gateway Transaction error: ', error);

            return new AppError(
                error.response?.data?.message ?? error.message
                , error.line||__line, error.file||__path.basename(__filename)
                , { name: error.name, status: error.status ?? 500, show: error.show });        
        }
    }
    async verifyTransaction ({ gatewayParams, query }) {
        try {
            const response = await axios.request({
                url: `${process.env.GTBANKSQUAD_BASE_URL}/transaction/verify/${query.reference}`,
                method: 'GET',
                headers: this.getHeaders(gatewayParams.businessSecret)
            })
            return response.data
        } catch (error) {
            return new AppError(
                error.response?.data?.message ?? error.message
                , error.line||__line, error.file||__path.basename(__filename)
                , { name: error.name, status: error.status ?? 500, show: error.show });
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
    createSubaccount ({data}) {
        return {
            success: true, 
            message: 'Subaccount created successfully', 
            data: { subAccountCode: data.subAccountId, metaId: null }
        }
    }
}

module.exports = GTSquadService;