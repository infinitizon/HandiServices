const PaymentService = require('../../services/payment.service');

const db = require('../../../database/models');
const transaction = require('../../services/transaction.service');
// const utils = require('../../utils/utils');
const helper = require('../../utils/helper');
const CloudObjUploadService  = require('../../services/cloud-obj-upload.service');

const AppError = require('../../../config/apiError');
const genericRepo = require('../../../repository');

class PaymentController {
    async list (req, res, next) {
        try {
            const {module, id} = req.query
            const service = await (new PaymentService({})).getPaymentGatewayList({module: module?.toLowerCase(), assetId: id});
            if(!service.success) throw Error('Error occured while fetching payment gateways! Please try again later');

            res.status(service.status).json(service);
            res.locals.resp = service;
        } catch (error) {
            console.error(error.message);
            return next(
                new AppError(
                    error.message ?? 'Error occured while fetching payment gateways! Please try again later'
                    ,error.line|| __line, error.file||__path.basename(__filename)
                    , {name: error.name, status: error.status??500, show: error.show}
                )
            );
        }
    }
    async getCustomerCardsForGateway (req, res ) {
        let resp;
        try {
            let criteria = Object.fromEntries(new URLSearchParams(req.query));
            if(!criteria.id) throw Error('Customer Id not present'); //criteria['customer_id'] = Customer.id;
            criteria['customer_id'] = criteria.id; delete criteria.id;

            const cards = await (new PaymentService({})).getCustomerCardsForGateway(criteria);
            if(cards.success){
                resp = { code: 200, success: true, data: cards.data };
            }else{
                resp = { code: 400, success: false, data: cards.data };
            }
            
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (e) {
            resp = { code: 500, success: false, data: e.message };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        }
    }
    static async initiate (req, res,) {
    /**
     * #swagger.request = 
    * #swagger.description = 'Create Offer Banks'
    * #swagger.responses[200] = {
       description: 'Offer Bank Added',
       schema: {
          $status: 200,
          $success: true,
          $message: 'RefCodes retrieved successfully',
          $data: {
                   $amount: 100,
                   $paymentMethod: "online",
                   $gateway: "paystack",
                   $asset_quantity: "1",
                   $transAmount: "1",
                   $description: "New deposit for ZMMF2",
                   $type: "New deposit for ZMMF2",
                   $asset_type: "New deposit for ZMMF2",
                   $fundName: "New deposit for ZMMF2",
                   $orderBase: "New deposit for ZMMF2",
                   $transType: "New deposit for ZMMF2",
                   $redirectUrl: "New deposit for ZMMF2",
                   $currency: "New deposit for ZMMF2",
                   $assetName: "New deposit for ZMMF2",
                   $callbackParams: {
                     $module: "invest",
                     $resident: true,
                     $tenor: "2",
                     $assetId: "44db193c-4e18-4635-b85c-958a25bc15a7",
                     $gatewayId: "8ad8054c-0a59-47e6-a9af-0a1e93e1429e",
                     $saveCard: false
                   },
                   $gatewayEndpoints: "https://HandiServices.azurewebsites.net/api/v1/3rd-party-services/gateway?modules=invest&id=7ad9054c-0a59-47e6-a9af-0a1e93e1429f",
                   $gatewayId: "8ad8054c-0a59-47e6-a9af-0a1e93e1429e",
                   $channel: "paystack"
          },
       }
    }
    * #swagger.responses[404] = {
          description: 'No user found'
       }
    * #swagger.responses[500] = {
          description: 'Server error'
       }
    */
        const t = await db[process.env.DEFAULT_DB].transaction();
        try {
            console.log(req.headers['content-type'])
            const { userId, tenantId } = res.locals.user
            const user = await genericRepo.setOptions('User', {
                condition: { id: userId }
            }).findOne()
            // const user1 = await db[process.env.DEFAULT_DB].models.customer.findByPk(User.id)
            let {txnHeader, txnDetails} = req.body
            // eslint-disable-next-line no-unused-vars
            let {currency, description, reference, source, type, gatewayParams, paymentType, savedCardId, gateway, redirectUrl, callbackParams, amount, details, } = txnHeader 
            
            txnHeader.tenantId = tenantId;

            callbackParams = (typeof callbackParams === 'string') ? JSON.parse(callbackParams) : callbackParams
            gatewayParams = (typeof gatewayParams === 'string') ? JSON.parse(gatewayParams) : gatewayParams
            
            let data = req.body;
            data = {...data, callbackParams, gatewayParams};

            
            reference = reference ? reference: helper.generateOTCode(20, true);
            txnHeader.reference = reference
            let txn = await (new transaction).createTransaction({
                txnBody: {
                    txnHeader,
                    txnDetails
                },
                ...(gateway !== 'bankTransfer' && {transaction: t}),
                returning: true,
            });
            data.reference = reference;
            let resp;
            
            if(!txn || !txn.success) 
                throw new AppError(txn.show?txn.message:`Error occured while saving transaction. Please try again later`, txn.line||__line, txn.file||__path.basename(__filename), {status: txn.status||400, show: txn.show});
        
            let cParams = Object.keys(callbackParams);
            cParams.forEach((key) => {
                redirectUrl = redirectUrl.trim() + '&' + key + '=' + callbackParams[key];
            });
            let paymentData = { success: false, message: 'Payment link could not be generated. Please try again later' };
            const assetParam = callbackParams?.assetId ? `/${callbackParams.assetId}` : '';
            const moduleParam = callbackParams?.module ? `/${callbackParams.module}` : '';
            if (gateway === 'bankTransfer') {
                let uploadImage;
                if (!req.files) throw new AppError('Please upload your proof of payment', __line, __path.basename(__filename), {status: 400, show: true});

                const uploaderService = new CloudObjUploadService({service: 'cloudniary'});
                uploadImage = await uploaderService.upload(req?.files?.image?.tempFilePath);     
                
                if(uploadImage.secure_url) {
                    await txn.createMedium({
                        name: uploadImage.original_filename,
                        type: uploadImage.format,
                        link: uploadImage.secure_url,
                        size: uploadImage.bytes,
                    });
                }
                const callback = await (new PaymentService({})).callPaymentCallback(process.env.BACKEND_BASE + `/3rd-party-services/payment/${gateway}/${callbackParams?.assetId}/${callbackParams.module.toLowerCase()}?redirectUrl=${redirectUrl}&amount=${amount}&reference=${reference}`);
                data['authorization_url'] = callback.redirectUrl;
            } else {
                const service = await (new PaymentService({})).getPaymentGatewayList({
                    module: callbackParams.module?.toLowerCase(), assetId: callbackParams?.assetId?.toLowerCase(), gatewayId: callbackParams?.gatewayId
                });
                if(!service.success || service.data?.length <= 0) 
                    throw Error(service.message??`There are no banks specified for the product`);

                let gatewayCard = service.data.find(g=>g.gateway ==gateway)
                if(!gatewayCard && gateway != 'wallet') throw Error(`The gateway chosen is not defined for product`);

                if(paymentType === 'saved_card'  && !callbackParams?.gatewayId) {
                    const getGatewayList = await (new PaymentService({})).getPaymentGatewayList({
                        module: callbackParams.module?.toLowerCase(), assetId: callbackParams?.assetId?.toLowerCase(), gatewayId: gatewayCard?.id
                    });
                    gatewayCard = getGatewayList.data[0];
                }
                if(gatewayParams) {
                    gatewayParams.subaccountId = gatewayCard?.subAccountId
                    gatewayParams.businessSecret = gatewayCard?.businessSecret
                } else {
                    gatewayParams = {
                        subaccountId: gatewayCard?.subAccountId,
                        businessSecret: gatewayCard?.businessSecret
                    }
                }
                let payload = {
                    user,
                    amount, currency,
                    txRef: reference,
                    redirectUrl,
                    gateway: gateway.toLowerCase(),
                    gatewayCallbackUrl: process.env.BACKEND_BASE + `/3rd-party-services/payment/${gateway}${assetParam}${moduleParam}`,
                    gatewayParams,
                    callbackParams
                }
                if(paymentType === 'saved_card') {
                    const tokenizedCard = await (new PaymentService({})).getCustomerCardsForGateway({id: savedCardId});
                    if(!tokenizedCard.success) throw Error(tokenizedCard.message??`We couldn't get your saved card!!!`);
                    payload.authorization = tokenizedCard.data[0].card_details;
                    paymentData = await PaymentService.chargeTokenizedCard(payload);
                } else {
                    paymentData = await (new PaymentService({})).initiate(payload);
                }

                if (!paymentData.success)
                    throw Error(paymentData.message??`We couldn't generate a payment link!!!`);

                data = { ...data, authorizationUrl: paymentData.data.link, ...paymentData.data, txnId: txn.TxnHeader.id};
            }                
            resp = {
                status: 200,
                success: true, data, message: 'Record saved successfully'
            };
            t.commit();

            res.status(resp.status).json(resp);
            res.locals.resp = resp;
        } catch (error) {
            t.rollback();
            console.log(error.message);
            const resp = { status: 400, success: false, message: error.message };
            // return next(new AppError(e.message, 400));
            res.status(resp.status).json(resp);
            res.locals.resp = resp;
        }
    }
    static async callbackUrl (req, res ) {
        const t = await db[process.env.DEFAULT_DB].transaction();
        try {
            console.log('Payment callback hit')
            console.log(req.query)

            const data = await (new PaymentService({})).gatewayCallback(req);
            // const data = await (new PaymentService({})).gatewayCallback(req.query, req.params?.module, req.params?.assetId, req);
            data.gateway = req.params['gateway'];
            const transaction = await genericRepo.setOptions('TxnHeader', {
                selectOptions: ['id', 'reference'],
                condition: {reference: data.txRef},
                inclussions: [
                    {
                        model: db[process.env.DEFAULT_DB].models.TxnDetail,
                        attributes: ['id'],
                        include: [
                            {
                                model: db[process.env.DEFAULT_DB].models.User,
                                attributes: ['id']
                            }
                        ]
                    }
                ]
            }).findOne()
            if(!transaction)
                throw new AppError(`Transaction Reference is not valid => ${data.txRef}`)
            // eslint-disable-next-line no-unused-vars
            const notifyModule = await (new PaymentService({})).completeModuleCallback({ module: req.params?.module?.toLowerCase() ?? data.options.module.toLowerCase(), data })
            // update Header and Details
            await genericRepo.setOptions('TxnHeader', {
                changes : { status: data.status, gatewayReference: data.gatewayRef, gatewayResponse: JSON.stringify(data?.verified) ?? data?.message, },
                condition: {id: transaction.id},
                transaction: t
            }).update()
            await genericRepo.setOptions('TxnDetail', {
                changes : { status: data.status, gatewayReference: data.gatewayRef, gatewayResponse: JSON.stringify(data?.verified) ?? data?.message, },
                condition: {txnHeaderId: transaction.id},
                transaction: t
            }).update()
            // await transaction.update(
            //     { status: data.status, gatewayReference: data.gatewayRef, gateway_response: JSON.stringify(data?.verified) ?? data?.message, },
            // );
            // if(notifyModule.success) {
            //     if(data.gateway === 'wallet' || data.paymentType=='saved_card' || req.query.reverify=='true') {
            //         res.status(200).json({ success: true, redirectUrl: data.redirectUrl + `?success=true` });
            //         return;
            //     }
            //     if(data.saveCard=='true' || data.saveCard===true) 
            //         await (new PaymentService({})).saveCard({ transaction, data })
            //     res.redirect(data.redirectUrl + `?success=true`);
            // } else {
            //     if(data.gateway === 'wallet' || data.gateway === 'bankTransfer' || data.paymentType=='saved_card' || req.query.reverify=='true') {
            //         res.status(data.status || 400).json({ success: false, redirectUrl: data.redirectUrl + `?success=false&message=${data.message}` });
            //         return
            //     }
            //     res.redirect(data.redirectUrl + `?success=false`);
            // }
            res.set({
                "Bypass-Tunnel-Reminder": "Juwon"
            })
            t.commit();
            // if(data.gateway === 'bankTransfer'){
            //     res.status(200).json({ success: data.success, redirectUrl: data.redirectUrl + `?success=${data.success}` });
            // }else{
                res.redirect(data.redirectUrl + `?success=${data.success}`)
            // }
            
            return;
        } catch (error) {
            console.log(error);
            t.rollback()
            if(req.params['gateway'] === 'wallet' || req.query.reverify=='true') {
                res.status(400).json({ success: false, redirectUrl: (req.query.redirectUrl?req.query.redirectUrl:process.env.FRONTEND_URL) + `?success=false&message=${error.message}`, message: error.message});
                return
            }
            res.redirect(req.query.redirectUrl + `?success=false&message=${error.message}`);
            // return next(new AppError(e.message, 400));
        }
    }

    async checkAccountBalance (req, res, next) {
        const {accountNumber, bankCode} = req.body
        const accountBalance = await this.accountSwitch({
            bankCode, 
            accountNumber
        })
        if(!accountBalance.success){
            return next(
                new AppError('account balance check failed', __line, __path.basename(__filename), {status: 400, show: true})
              );
        }
        let resp = {
            code: 200,
            success: true,
            // data: {
                accountBalance: accountBalance.data.balance
            // },
          };
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
    }
    async chargeTokenizedCard (req, res ) {
        const tokenized = await PaymentService.chargeTokenizedCard(req.body)

        let resp = tokenized
        resp.code = tokenized.code;
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
    }

    async accountSwitch ({bankCode, accountNumber}) {
        const x = bankCode.trim()
        switch(x){
            case '044':{
                const accessBankService = {} //await new AccessBankService({ url: process.env.ACCESS_AUTH_BASE, resource: process.env.ACCESS_CHDM_RESOURCE, client_id: process.env.ACCESS_CHDM_CLIENT_ID, client_secret: process.env.ACCESS_CHDM_CLIENT_SECRET});
                const accountBalance = await accessBankService.getBalance({
                    accountNumber
                })
                return accountBalance
            }
            // case '058': {}
        }
    }

    async getTransfers ( req, res ) {
        
        let resp;
        try {
            let criteria = Object.fromEntries(new URLSearchParams(req.query));
            if(criteria.status) criteria.status = criteria.status.split(',');

            const cards = await (new PaymentService({})).getTransfer(criteria);
            if(cards.success){
                resp = { code: 200, success: true, data: cards.data };
            }else{
                resp = { code: 400, success: false, data: cards.data };
            }
            
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (e) {
            resp = { code: 500, success: false, data: e.message };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        }
    }
    async transfer ( req, res ) {
        let resp;
        try{
            const {id, amount, narration, senderName} = req.body;
            
            const logTransfer = (await (new PaymentService({})).getTransfer({id}))?.data[0] || {
                // amount, narration, split: 100, source_reference: req.body.source_reference||uuidv4(), 
                // destination_account: req.body.destination_account, 
                // destination_bank_name: req.body.destination_bank_name, 
                // source_account: req.body.source_account, 
                // destination_bank_code: req.body.destination_bank_code,
                // status: 'success'
            };
            if(!logTransfer.id) {
                logTransfer.payload = JSON.stringify(logTransfer)
            }
            const accessBankService = {} //await new AccessBankService({ url: process.env.ACCESS_AUTH_BASE, resource: process.env.ACCESS_CHDM_RESOURCE, client_id: process.env.ACCESS_CHDM_CLIENT_ID, client_secret: process.env.ACCESS_CHDM_CLIENT_SECRET});
            const tx = await accessBankService.transfer({
                amount, narration, senderName: senderName||'Invest Naija',
                beneficiaryAccount: logTransfer.destination_account, beneficiaryName: logTransfer.destination_bank_name,
                debitAccountNumber: logTransfer.source_account, destinationBankCode: logTransfer.destination_bank_code,
            })
            const { message, ...args } = tx
            resp = {
                message: "Transaction successful",
                data: tx.data,
                code: 200,
                status: true
            }
            logTransfer.response = JSON.stringify({...args, message})
            if(!tx.success) {
                logTransfer.status = "failed"
                resp.message = `Withdrawal is processing`;
                resp.status = false;
            }
            if(logTransfer.id)
                await logTransfer.save();
            else {
                logTransfer.narration
                await db[process.env.DEFAULT_DB].models.sweep_queue.create(logTransfer)
            }
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        } catch (error) {
            resp = { code: 500, success: false, data: error.message };
            res.status(resp.code).json(resp);
            res.locals.resp = resp;
        }
    }
}

module.exports = PaymentController;