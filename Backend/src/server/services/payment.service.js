const Gateways = {
  flutterwaveService: require('./gateways/flutterwave.service'),
  paystackService: require('./gateways/paystack.service'),
  gtsquadService: require('./gateways/gtbanksquad.service'),
  quicktellerService: require('./gateways/quickteller.service'),
  walletService: require('./gateways/wallet.service'),
  bankTransferService: require('./gateways/bank-transfer.service'),
};

var FormData = require('form-data');
const axios = require('axios');

// const SavePlanService = require('../services/saveplan.service');
// const FundsAppService = require('./fundservice.service');
const { postgres, Sequelize } = require('../../database/models');
const AppError = require('../../config/apiError');
const genericRepo = require('../../repository');
class PaymentService {
  constructor({gateway='paystack', initialize}) {
     this.gateway = new Gateways[gateway+'Service']({initialize});
  }
  async initiate  ({
    user,
    amount,
    currency,
    txRef,
    redirectUrl = '',
    gateway = 'flutterwave',
    gatewayCallbackUrl = '',
    gatewayParams,
    callbackParams
  }) {
    try {
      let callbackUrl = gatewayCallbackUrl ? gatewayCallbackUrl : process.env.APP_BASE_URL + '/savings/payment';
      
      const Gateway = await (new Gateways[gateway+'Service']({gatewayParams}));
      return await Gateway.intitializeTransaction({
          user,
          amount,
          currency,
          callbackUrl,
          txRef,
          redirectUrl,
          gatewayParams,
          callbackParams
      });
    } catch (error) {
      throw new AppError(error.message, __line, __path.basename(__filename), {status: 400, show: true});
    }
  }

  async gatewayCallback (req) {
    const query = req.query;
    const params = req.params;
    const body = req.body;
    const headers = req.headers;
    let { amount, redirect_url, reference, payment_type } = query;

    const {success, message, data} = await this.getPaymentGatewayList({module: params.module, assetId: params.assetId, query});
    // const gateway_params = call[0].ProductBankGateways.find((g)=>{
    const gateway_params = data.find((g)=>{
      g?.gateway?.toLowerCase()=== req.params.gateway
    });
    const {Gateway, verified} = await PaymentService.verifyTransaction({gateway: params.gateway, gateway_params, query, params, body});

    const callback = await Gateway.callback({verified, gateway_params, headers, query, params, body});
    return callback;
  };

  static async verifyTransaction ({gateway, gateway_params, query, params, body}) {
    const Gateway = await (new Gateways[gateway+'Service']({gateway_params: gateway_params ?? {business_secret: null}}));
    return {
      Gateway,
      verified: await Gateway.verifyTransaction({gateway_params, query, params, body})
    };
  }
  async chargeTokenizedCard ({
    email, amount, currency, authorization, txRef, gateway, gateway_params, callback_params
  }) {
    try {
      const Gateway = await (new Gateways[gateway+'Service']({gateway_params}));
      const tokenized_card = await Gateway.chargeTokenizedCard({ email, amount, currency, authorization, txRef, gateway_params, callback_params });
      return tokenized_card;
    } catch (error) {
      throw error;
    }
  }
  async call3rdPartyServices ({authorization, uuid_token, data, files}) {
      try {
          const formData = new FormData();
          for (let d in data) {
            formData.append(d, ((typeof data[d] === 'object' || Array.isArray(data[d])) ? JSON.stringify(data[d]) : data[d]))
          }
          if (files) {
            for (let file in files) {
              formData.append(file, files[file].data, {
                  filename: files[file].name,
                  contentType: files[file].mimetype,
                  knownLength: files[file].size
              })
            }
          }
          const response = await axios.request({
              method: 'POST',
              url: `${process.env.BACKEND_BASE}/3rd-party-services/payment/initiate`,
              data: formData,
              headers: {
                  ...formData.getHeaders(),
                  "authorization": authorization,
                  "x-uuid-token": uuid_token
              }
          });
          return response.data;
      } catch (error) {
        return new AppError(
          error.response.data.message?? error.message
              , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.response.status??500, show: error.show})
      }
  };
  async callPaymentCallback (wallet_url) {
    try {
      const response = await axios.request({
        method: 'GET',
        url: wallet_url,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  };
  async completeModuleCallback ({ module, data }) {
    try {
      // if (!data.success) return data; // If there was a failure while verifying the data, return error

      const url = await this.getModuleEndpoint({ module });
      const response = await axios.request({
        method: 'POST',
        url,
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return new AppError(
        error.response.data?.message ||  error.response.data?.error?.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error?.response?.status??500, show: error.show})
    }
  };
  async getModuleEndpoint ({ module }) {
    switch (module) {
      case 'order':
      case 'wallet':
        return `${process.env.BACKEND_BASE}/users/${module}/complete`;
    }
  }
  async getPaymentGatewayList ({module, assetId, gatewayId, query}) {
      let call = null;
      // if(['saveplan','tradein'].includes(module)){
      //     call = await SavePlanService.getProductBanks(assetId, module);
      //     call.data = call.data[0]?.saveplan_asset_banks_gateways
      // } 
      // if(module === 'invest'){
      //     call = await (new FundsAppService).getProductBankGateway(assetId)
      // }
      // call = await db[process.env.DEFAULT_DB].models.Product.findAll({
      //   attributes: {exclude: ['updatedAt']},
      //   where: {commonId: assetId, commonType: 'assets'},
      //   include: [
      //     {
      //       model: db[process.env.DEFAULT_DB].models.ProductBankGateway,
      //       attributes: {exclude: ['updatedAt']},
      //     }
      //   ],
      //   order: [Sequelize.literal('random()')]
      // })
      call = [{
        ProductBankGateways: [
          { id: 1, gateway: 'paystack', subAccountId: null, },
          // { id: 2, gateway: 'flutterwave', subAccountId: null, },
        ]
      }];

      const gateways = call[0]?.ProductBankGateways || [];
      // const jsonData = gateways?.map(instance => instance.toJSON());
      const jsonData = gateways;
      if(jsonData.length < 1)
        throw new AppError( `Could not fetch payment gateways. Please contact admin`, __line, __path.basename(__filename), { status: 500, show: true} )
        
      if(gatewayId) jsonData = jsonData.filter(g=>g.id==gatewayId) || jsonData.filter(g=>g.id==1);
      else if(query && query.reverify=='true') jsonData ;
      else {
        jsonData.map(gateway => {
          delete gateway.subAccountId
          delete gateway.businessSecret
        })
      }
      return {success: true, status: 200, message: `Gateways fetched successfully`, data: jsonData}
  }
  async saveCard ({ transaction, data }) {
    try {
      const cardExists = await this.getCustomerCardsForGateway({
        customer_id: transaction.customer.id,
        gateway: data.gateway,
      });
      let found = false;
      if (!cardExists.success) throw Error(cardExists.message);
      for (let dbCard of cardExists.data) {
        if (
          dbCard.card_details.first_6digits === data.card.first_6digits &&
          dbCard.card_details.last_4digits === data.card.last_4digits
        ) {
          found = true;
        }
      }
      if (!found && ['card'].includes(data.card.channel)) {
        // update all cards to false first
        for (let dbCard of cardExists.data) {
          await dbCard.update({ isActive: false });
        }
        return await db[process.env.DEFAULT_DB].models.card.create({
          customer_id: transaction.customer.id,
          gateway: data.gateway,
          card_details: data.card,
          is_active: true,
        });
      }
    } catch (e) {
      return;
    }
  };
  async getCustomerCardsForGateway (criteria) {
    try {
      const keys = Object.keys(criteria)
      let whereGeneral = []
      // let whereSavePlan=[];
      for(const key of keys) {
        whereGeneral.push(db.Sequelize.literal(`${key}='${criteria[key]}'`))
      }
      const cards = await db[process.env.DEFAULT_DB].models.card.findAll({
        where: {
          [db.Sequelize.Op.and]: whereGeneral
        },
      });
      return { success: true, data: cards };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };
  async getTransfer (criteria) {
    try {
      const transfers = await db[process.env.DEFAULT_DB].models.sweep_queue.findAll({
        where: {
          [db.Sequelize.Op.and]: criteria
        },
      });
      return { success: true, data: transfers };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };
  async getProductBankGateway ({assetId}) {
    return await genericRepo.setOptions('ProductBank', {
        condition: {
            commonId: assetId,
            commonType: 'assets'
        },
        inclussions: [
            {
                model: db[process.env.DEFAULT_DB].models.ProductBankGateway,
                attributes: ['gateway', 'sub_account_id', 'business_secret']
            }
        ]
    }).findOne()
  }
  async createSubaccount (body) {
      try {
          const subAccount = await this.gateway.createSubaccount({...body})
          return subAccount
      } catch (error) {
          return new AppError(error.message, __line, __path.basename(__filename), {status: 500});
      }
      // return next()
  }
  async deleteSubaccount (gateway, body) {
      try {
          const subAccount = await this.gateway.deleteSubaccount(body)
          return subAccount;
      } catch (error) {
          return new AppError(error.message, __line, __path.basename(__filename), {status: 500}) ;
      }
  }
}
///m
module.exports = PaymentService;
