const axios = require('axios').default;
const AppError = require('../../../config/apiError');
const Helper = require('../../utils/helper');

class AccessBankService {
    formUrlEncoded (obj) {
        return Object.keys(obj).reduce((p, c) => p + `&${c}=${encodeURIComponent(obj[c])}`, '')
    }
    constructor ({ url, grantType='client_credentials', resource, clientId, clientSecret}) {
        return (async () => {
            const response = await await axios.request({
                method: 'POST',
                url,
                // eslint-disable-next-line camelcase
                data: this.formUrlEncoded({ grant_type: grantType, resource, client_id: clientId, client_secret: clientSecret }),
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Ocp-Apim-Subscription-Key": process.env.ACCESS_SUBSCRIPTION_KEY
                }
            })
            this.token = response.data.access_token;
            return this; // Return the newly-created instance
        })();
    }
    async transfer  ({
        appId=process.env.ACCESS_CHDM_CLIENT_ID,
        amount, currency="NGN", narration,
        beneficiaryAccount = '0738478524', beneficiaryName,
        debitAccountNumber, destinationBankCode='044', 
        senderName="", senderCountry='NG',
        newCustomer=false, newCustomerDetails
    })  {
        try {
            let payload = {
                auditId: Helper.generateOTCode(7, false), appId,
                debitAccount: debitAccountNumber, debitAccountNumber,
                beneficiaryAccount, beneficiaryName,
                amount, currency, narration,
            };            
            const url = `${process.env.ACCESS_FINTECH_BASE}/${(destinationBankCode==='044'? 'bankAccountFT': 'otherBankAccountFT')}`
            if(destinationBankCode === '044') {
                delete payload.debitAccountNumber;
                payload.newCustomer = newCustomer
                if(newCustomer) payload.newCustomerDetails = newCustomerDetails
            } else {
                delete payload.debitAccount
                payload.bank=destinationBankCode
                payload.senderName=senderName; payload.senderCountry=senderCountry;
            }
    
            const response = await axios.request({
                url, method: 'POST',
                data: JSON.stringify(payload),
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.ACCESS_SUBSCRIPTION_KEY
                }
            })
            if(!response.data.success || ![1,2].includes(response.data?.payment?.status))
                throw new AppError(response.data.message, __line, __path.basename(__filename), { status: 500, show: false});

            return response.data;
        } catch (error) {
            return new AppError(
                error.message +"<=>"+error?.response?.data?.message , error.line||__line, error.file||__path.basename(__filename),
                { status: error?.response?.status||error.status||500, show: error.show||true});
        }
    }
    async getBalance ({appId=process.env.ACCESS_CHDM_CLIENT_ID, accountNumber})  {
        try {
            let payload = {
                appId, auditId: Helper.generateOTCode(7, false),
                accountNumber
            }
    
            const response = await axios.request({
                method: 'POST',
                url: `${process.env.ACCESS_FINTECH_BASE}/getAccountBalance`,
                data: JSON.stringify(payload),
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.ACCESS_SUBSCRIPTION_KEY
                }
            })
            if(!response.data.errors){
                return {success: true, data:{balance: response.data.clearedBalance}};
            }else{
                const keys = Object.keys(response.data.errors);
                let errors = []
                for(let k of keys){
                    errors.push(response.data.errors[k][0])
                }
                return {success: false, data:{balance: null, message: errors}};
            }
            
        } catch (error) {
            console.error(error?.response?.data);
            return{success: false, data: {balance: null, message: error?.response?.data}}
        }
    }
    async verifyAccount ({ nuban, bankCode, appId=process.env.ACCESS_CHDM_CLIENT_ID }) {
        try {
            let payload = {
                appId, auditId: Helper.generateOTCode(7, false),
                bank: bankCode
            }
            bankCode=='044' ? payload.accountNumber = nuban : payload.beneficiaryAccountNumber = nuban;
            let response = await axios.request({
                method: 'POST',
                url: `${process.env.ACCESS_FINTECH_BASE}/${payload.bank=='044'?'getBankAccountName':'getOtherBankAccountName'}`,
                data: JSON.stringify(payload),
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.ACCESS_SUBSCRIPTION_KEY
                }
            });
            if(!response) throw Error('Error fetching bank account name');
            return {
                data: {
                    accountName: response?.data?.accountName,
                    nuban: response?.data?.accountNumber,
                    message: response?.data?.message,
                },
                status: (response.data.success ? 'success' : 'failure')
            };
        } catch (error) {
            console.error(error);
            return {
                data: { accountName: null, nuban: null, message: null, },
                message: error.message,
                success: 'failure'
            };
        }
    }
    async getBankList ({ appId=process.env.ACCESS_CHDM_CLIENT_ID })  {
        try {
            let body = {
                appId, auditId: Helper.generateOTCode(7, false)
            }
            const response = await axios.request({
                method: 'POST',
                url: `${process.env.ACCESS_FINTECH_BASE}/getOtherBankList`,
                data: JSON.stringify(body),
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.ACCESS_SUBSCRIPTION_KEY
                }
            })
            response.data.banks.unshift({code: "044", name: "ACB - Access Bank Plc"});
            return {...response.data, status: 'success'};
        } catch (error) {
            console.error(error);
            return;
        }
    }
    
}

module.exports = AccessBankService;