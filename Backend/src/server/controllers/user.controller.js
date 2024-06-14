const db = require('../../database/models');
const DBEnums = require('../../database/db-enums');
const CryptoJS = require('../utils/crypto')
const AppError = require('../../config/apiError');
const { UserService, NOKService, CloudObjUploadService, AuthService, CustomerWalletService, VerificationsService, OrderService, ProductService } = require('../services')
const AddressService = require('../services/address.service');
const { successResponse } = require('../utils/responder');
const genericRepo = require('../../repository');
class UserController {
  
   static async getUserDetails (req, res, next) {
       /**
       * #swagger.tags = ['User Routes']
       * #swagger.description = 'To get Users Details'
       * #swagger.responses[200] = {
             description: 'User Details retrieved successfully',
            schema: {
                  $status: 200,
                  $success: true,
                  $message: true,
                  $data: {
                     $id: "",
                     $bvn: "",
                     $p_id: "",
                     $firstName: "",
                     $lastName: "",
                     $email: "",
                     $isEnabled: "",
                     $isLocked: "",
                     $Beneficiaries: [],
                     $CSCs: [],
                     $Tenant: [
                        {
                           $name: "CHDS",
                           $Roles: [
                              {
                                 $name: "PROVIDER_ADMIN",
                                 $description: "Manages tenant"
                              }
                           ]
                        }
                     ]
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
      try{
         let {userId, tenantId} = res.locals.user;
         
         if(!userId) throw new AppError(`Your identity is not clear. Either signin or contact admin`, __line, __path.basename(__filename), { show: true });

         const user = await UserService.getDetails({ userId, tenantId })
         return successResponse(req, res, user)
      }catch(error){
         console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
      }
   }

   static async updateProfile (req, res, next) {
      let uploaded;
      let uploaderService
      try {
         let auth = res.locals.user;
         let body = req.body;
         if(body.password)
            body.password = (new CryptoJS({ aesKey: process.env.SECRET_KEY_AES, ivKey: process.env.SECRET_KEY_IV })).decryptWithKeyAndIV(body.password);

         if(req.files) {
            let { avatar } = req.files;
            uploaderService = new CloudObjUploadService({service: 'cloudinary'});
            uploaded = await uploaderService.upload(avatar);
            if(!uploaded || !uploaded.success)
               throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
            body = {...body, Media: {
               name: avatar.name,
               type: avatar.mimetype,
               size: avatar.size,
               objectType: 'avatar',
               response: uploaded.data
            }}
         }
         const userService = new UserService;
         const updated = await userService.updateProfile({ userId: auth.userId, changes: body, })
         if(!updated || !updated.success)
            throw new AppError(updated.message, updated.line||__line, updated.file||__path.basename(__filename), { status: updated.status||500 });

         res.status(updated.status).json(updated);
         res.locals.resp = updated;
      } catch (error) {
         if(uploaded) {
            await uploaderService.delete({ id: uploaded.id });
         }
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async cartify (req, res, next) {
      const t = await db[process.env.DEFAULT_DB].transaction()
      try {
         let auth = res.locals.user;
         const params = req.params;
         if(!auth) {
            auth = req.headers['authorization'];
            let role = req.headers['role']
            if (!auth || role != 'CUSTOMER') throw new AppError('You need to login as a customer to continue', __line, __path.basename(__filename), { status: 402, show: true });
            if (auth && auth.startsWith('Bearer ')) {
                auth = auth.slice('7', auth.length);
            }
            const authorized = await AuthService.verifyToken(auth, process.env.ACCESS_TOKEN_SECRET);
            if(!authorized.success) throw new AppError('Authentication invalid/Expired. Please login again', __line, __path.basename(__filename), { status: 402, show: true });
            
            auth = {role, ...authorized.data};
         }
         const orderOrder = new OrderService;
         const {addresses, orders } = req.body;
         
         const user = await UserService.getDetails({ userId: auth.userId });

         const order = await orderOrder.createOrder({ auth, params, orders, transaction: t });
         if(!order || !order.success) 
            throw new AppError(order.show?order.message:`Error creating order`, __line, order.file||__path.basename(__filename), { status: order.status||500, show: order.show });
         
         for (const addr of addresses) {
            const address = addr.id ?
                     await (new AddressService()).updateAddress({ userId: auth.userId, ...addr, transaction: t }) :
                     await (new AddressService()).addAddress({ user, ...addr, transaction: t });
            if (!address.success) throw new AppError(address.message, address.line||__line, address.file||__path.basename(__filename), { status: address.status||404, show: address.show||true });

            await order.data.addAddress(address.data, { transaction: t });
         }


         await t.commit();
         res.status(order.status).json(order);
      } catch (error) {
         console.error(error.message);
         await t.rollback();
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }

   static async fetchRefCodes (req, res, next) {
      /**
      * #swagger.tags = ['User RefCodes']
      * #swagger.description = 'To get Users RefCodes'
      * #swagger.responses[200] = {
         description: 'User RefCodes retrieved successfully',
         schema: {
            $status: 200,
            $success: true,
            $message: 'RefCodes retrieved successfully',
            $data: [{
               $id: "532dcf16-ba6b-43ec-a5b5-f056836f39d7",
               $refCode: "AS2Eda",
               $firstName: "ADEYINKA",
               $middleName: "RAPHEAL",
               $lastName: "SOBOWALE"
            }],
         }
      }
      * #swagger.responses[404] = {
            description: 'No user found'
         }
      * #swagger.responses[500] = {
            description: 'Server error'
         }
      */
      try {
         const refCodes = await genericRepo.setOptions('User', {
            condition: { refCode: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: '%' + req.query.q + '%',} },
            selectOptions: ['id', 'refCode', 'firstName', 'middleName', 'lastName'],
            order: [['firstName', 'ASC']]
         }).findAll();
          
         return successResponse(req, res, refCodes, `RefCodes retrieved successfully`);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }

   static async getAddress (req, res, next) {
      /**
       * #swagger.tags = ['User Address Routes']
       * #swagger.description = 'Add an address to a user'
       *  #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Create an address for auser',
            schema: {
                  $houseNo: '6',
                  $address1: 'Bankole Oki',
                  $city: 'Ikoyi',
                  $country: 'NG',
                  $state: 'LG',
                  $latitude: 10.123,
                  $longitude: 7.891
            }
          } 
       */
      try {
         const { addressId } = req.params;

         const addressService = new AddressService;
         const address = await addressService.getAddress({ addressId })
         // check if a valid response is provided
         if (!address.success) 
            throw new AppError(address.message, address.line||__line, address.file||__path.basename(__filename), { status: address.status||404, show: address.show||true });
      
         res.status(address.status).json(address);
         res.locals.resp = address;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async getAddresses (req, res, next) {
      /**
       * #swagger.tags = ['User Address Routes']
       * #swagger.description = 'Add an address to a user'
       *  #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Create an address for auser',
            schema: {
                  $houseNo: '6',
                  $address1: 'Bankole Oki',
                  $city: 'Ikoyi',
                  $country: 'NG',
                  $state: 'LG',
                  $latitude: 10.123,
                  $longitude: 7.891
            }
          } 
       */
      try {
         const { userId } = res.locals.user;

         const addressService = new AddressService;
         const addresses = await addressService.getAddresses({ userId: req.query.userId||userId })
         // check if a valid response is provided
         if (!addresses || !addresses.success) 
            throw new AppError(addresses.message, addresses.line||__line, addresses.file||__path.basename(__filename), { status: addresses.status||404, show: addresses.show });
      
         res.status(addresses.status).json(addresses);
         res.locals.resp = addresses;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async addAddress (req, res, next) {
      /**
       * #swagger.tags = ['User Address Routes']
       * #swagger.description = 'Add an address to a user'
       *  #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Create an address for auser',
            schema: {
                  $houseNo: '6',
                  $address1: 'Bankole Oki',
                  $city: 'Ikoyi',
                  $country: 'NG',
                  $state: 'LG',
                  $latitude: 10.123,
                  $longitude: 7.891
            }
          } 
       */
      try {
         const { userId } = res.locals.user;

         const user = await UserService.getDetails({userId})
         const address = await (new AddressService()).addAddress({ user, ...req.body })
         
         // check if a valid response is provided
         if (!address.success) throw new AppError(address.message, address.line||__line, address.file||__path.basename(__filename), { status: address.status||404, show: address.show||true });
      
         res.status(address.status).json(address);
         res.locals.resp = address;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async updateAddress (req, res, next) {
      /**
       * #swagger.tags = ['User']
       * #swagger.description = 'Add an address to a user'
       *  #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Create an address for auser',
            schema: {
                  $houseNo: '6',
                  $address1: 'Bankole Oki',
                  $city: 'Ikoyi',
                  $country: 'NG',
                  $state: 'LG',
                  $latitude: 10.123,
                  $longitude: 7.891
            }
          } 
       */
      try {
         const { userId } = res.locals.user;
         const params = req.params;

         const address = await (new AddressService()).updateAddress({ id: params.addressId, userId: req.body.userId||userId, ...req.body})
         
         // check if a valid response is provided
         if (!address.success) throw new AppError(address.message, address.line||__line, address.file||__path.basename(__filename), { status: address.status||404, show: address.show||true });
      
         res.status(address.status).json(address);
         res.locals.resp = address;
         
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async deleteAddress (req, res, next) {
      try {
         const params = req.params;
         const address = await (new AddressService()).deleteAddress({ id: params.addressId });
         if (!address.success) throw new AppError(address.message, address.line||__line, address.file||__path.basename(__filename), { status: address.status||404, show: address.show||true });
      
         res.status(address.status).json(address);
         res.locals.resp = address;
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }      
   }
   static async getCountries (req, res, next) {
      try {
         let countries = await (new AddressService()).getCountries()
      
         // check if a valid response is provided
         if (!countries.success) 
            throw new AppError(countries.message, countries.line||__line, countries.file||__path.basename(__filename), { status: countries.status||404, show: countries.show||true });
      
      
         res.status(countries.status).json(countries);
         res.locals.resp = countries;
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async getCountryStates (req, res, next) {
      try {
         const {iso} = req.params;

         let states = await (new AddressService()).getCountryStates(iso)
         // check if a valid response is provided
         if (!states.success) 
            throw new AppError(states.message, states.line||__line, states.file||__path.basename(__filename), { status: states.status||404, show: states.show||true });
      
      
         res.status(states.status).json(states);
         res.locals.resp = states;
      } catch (error) {
         console.log(error.message);
         return next(
                  new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   
   static async getWallet (req, res, next) {
      /**
       * #swagger.tags = ['User Routes']
      * #swagger.description = 'To get user wallet'
      * #swagger.responses[200] = {
         description: 'Wallet retrieved successfully',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Wallet retrieved successfully',
            $data: [{
               $id: "532dcf16-ba6b-43ec-a5b5-f056836f39d7",
               $total: "300",
               $currency: "NGN",
               $isEnabled: true,
               $isLocked: false
            }],
         }
      }
      * #swagger.responses[404] = {
            description: 'No user found'
         }
      * #swagger.responses[500] = {
            description: 'Server error'
         }
      */
      try {
         const { userId } = res.locals.user;
         const wallet = await (new CustomerWalletService).getWallet({ userId});
         if(!wallet || !wallet.success) 
            throw new AppError(wallet.message||`Wallet not found`, wallet.line||__line, wallet.file||__path.basename(__filename), { name: wallet.name, status: wallet.status, show: wallet.show })
          
         return successResponse(req, res, wallet.data, `Wallet retrieved successfully`);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async fundWallet (req, res, next) {
      /**
       * #swagger.tags = ['User Routes']
      * #swagger.description = 'Initiate wallet funding'
      * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Login a user to app',
                schema: {
                    $amount: 100,
                    $currency: "NGN",
                    $gateway: "paystack",
                    $gateway: "paystack",
                }
            }'
      * #swagger.responses[200] = {
         description: 'Wallet retrieved successfully',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Wallet retrieved successfully',
            $data: [{
               $id: "532dcf16-ba6b-43ec-a5b5-f056836f39d7",
               $total: "300",
               $currency: "NGN",
               $isEnabled: true,
               $isLocked: false
            }],
         }
      }
      * #swagger.responses[404] = {
            description: 'No user found'
         }
      * #swagger.responses[500] = {
            description: 'Server error'
         }
      */
      try {
         const { userId } = res.locals.user;
         const wallet = await (new CustomerWalletService).getWallet({ userId});
         if(!wallet || !wallet.success) 
            throw new AppError(wallet.message||`Wallet not found`, wallet.line||__line, wallet.file||__path.basename(__filename), { name: wallet.name, status: wallet.status, show: wallet.show })
          
         return successResponse(req, res, wallet.data, `Wallet retrieved successfully`);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }

   static async addNOK (req, res, next) {
      try {
         const { userId } = res.locals.user;
         const body = req.body;
         const nok =  await (new NOKService).addNOK({ userId, body });
         if (!nok || !nok.success)
            throw new AppError(nok.show?nok.message:`Could not add Next of Kin`, __line, __path.basename(__filename), { status: 403, show: nok.show });
         
         res.status(nok.status).json(nok);
         res.locals.resp = nok;
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
         );
      }
   }
   static async getNOK (req, res, next) {
      try {
         const { userId } = res.locals.user;
         const noks =  await (new NOKService).getNOKs({ userId })
         if (!noks || !noks.success)
            throw new AppError(noks.show?noks.message:`Couldn't fetch next of kin details`, __line, __path.basename(__filename), { status: noks.status, show: noks.show });
         
         const data = JSON.parse(JSON.stringify(noks.data[0]));
         res.status(noks.status).json({...noks, data: {...data, relationship: DBEnums.NOKRelationships.find(g=>g.label===data.relationship)}});
         res.locals.resp = noks;
      } catch (error) {
         console.error(error.message);
         return next(
                    new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
                );
      }
   }
   static async updateNOK (req, res, next) {
      try {
         const {id} = req.params;
         const updates = req.body;
         const updated =  await (new NOKService).updateNOK({ id, updates })
         if (!updated || !updated.success)
            throw new AppError(updated.show?updated.message:`Couldn't fetch next of kin details`, __line, __path.basename(__filename), { status: updated.status, show: updated.show });
         
         res.status(updated.status).json(updated);
         res.locals.resp = updated;
      } catch (error) {
         console.error(error.message);
         return next(
                    new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
                );
      }
   }

   static async getBeneficiary (req, res, next) {
      try {
         const { userId } = res.locals.user;
         const beneficiary =  await UserService.getBeneficiaries({ userId })
         if (!beneficiary || !beneficiary.success)
            throw new AppError(beneficiary.message||'Update beneficiary account to proceed.', __line, __path.basename(__filename), { status: 403, show: true });
         
         res.status(beneficiary.status).json(beneficiary);
         res.locals.resp = beneficiary;
      } catch (error) {
         console.error(error.message);
         return next(
                    new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
                );
      }
   }
   
   static async addBeneficiary (req, res, next) {
      try {
         const { userId } = res.locals.user;
         let { id, nuban, bankCode, bankName, bankAccountName } = req.body;
         const user = await db[process.env.DEFAULT_DB].models.User.findByPk(userId);
         // const bvn = await db[process.env.DEFAULT_DB].models.bvnData.findOne({where: {customerId}})
         if (!user.isEnabled || user.isLocked)
            throw new AppError('Verify your account to proceed', __line, __path.basename(__filename), { status: 403, show: true });
         
         let verifyNUBAN = await (new VerificationsService({vendor: 'paystack'}));
         const response = await verifyNUBAN.verifyNUBAN({
            nuban, bankCode: bankCode,
         });
         if (!response.success) throw new AppError(response.message, __line, __path.basename(__filename), { status: response.status });

         let beneficiary =  await UserService.getBeneficiaries({ userId, bankCode });         
         if (!beneficiary || !beneficiary.success)
            throw new AppError(beneficiary.message||`Verify your account to proceed`, __line, __path.basename(__filename), { status: 403, show: true });

         beneficiary =  await UserService.addBeneficiary({ id, userId, nuban, bankCode, bankName, bankAccountName,  });
         if (!beneficiary || !beneficiary.success)
            throw new AppError(beneficiary.message||'Update beneficiary account to proceed.', __line, __path.basename(__filename), { status: 403, show: true });

         res.status(beneficiary.status).json(beneficiary);
         res.locals.resp = beneficiary;
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   
   static async getOrders (req, res, next) {
      try {
         const auth = res.locals.user;
         // const params = req.params;
         let query = req.query;
         query = { ...query, userId: auth.userId }
         const orderService = new OrderService

         const orders = await orderService.getOrders({ auth, query })
         if(!orders || !orders.success)
            throw new AppError(orders.show?orders.message:`Error occured while fetching orders`, orders.line||__line, orders.file||__path.basename(__filename), { status: orders.status||409, show: orders.show});
         
         res.status(orders.status).json(orders);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
            )
         );
      }
   }

   static async updateStatus (req, res, next) {
      try {
         const orderService = new OrderService

         const orders = await orderService.updateOrderStatus({ orderId: req.params.orderId, status: req.body.status })
         if(!orders || !orders.success)
            throw new AppError(orders.show?orders.message:`Error occured while fetching orders`, orders.line||__line, orders.file||__path.basename(__filename), { status: orders.status||409, show: orders.show});
         
         res.status(orders.status).json(orders);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message,
               error.line || __line,
               error.file || __path.basename(__filename),
               { name: error.name, status: error.status ?? 500, show: error.show }
            )
         );
      }
   }
   static async cart (req, res, next) {
      console.log(`Trying to complete the spayment`)
      try {
         const auth = res.locals.user;
         const orderService = new OrderService
         const cart = await orderService.getOrderDetails({ ...(auth.role=='CUSTOMER' && {userId: auth.userId}), orderId: req.query.orderId, query: req.query })
         
         res.status(cart.status).send(cart);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async updateOrderItem (req, res, next) {
      console.log(`Trying to complete the spayment`)
      try {
         // const auth = res.locals.user;
         const {orderId} = req.params;
         const { value } = req.body;
         if(!orderId)
            throw new AppError(`Order Id missing in route param`, __line, __path.basename(__filename), { status: 500, show: true });
         const orderService = new OrderService
         const order = await orderService.updateOrder({ order: {orderId, value} });
         if(!order || !order.success)
            throw new AppError(order.show?order.message:`Order update failed. Please try again later`, order.file||__line, order.file||__path.basename(__filename), { status: order.status||500, show: order.show });
         
         res.status(order.status).send(order);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async checkout (req, res, next) {
      console.log(`Trying to complete the spayment`)
      try {
         const orderService = new OrderService;

         let data = req.body;
         const pmt = await orderService.call3rdPartyServices({
            authorization: req.headers.authorization,
            uuidToken: req.headers['x-uuid-token'],
            data,
         });
         if (!pmt || !pmt.success) 
            throw new AppError(pmt.show?pmt.message:'Payment could not be initiated', pmt.line||__line, pmt.file||__path.basename(__filename), { status: pmt.status||400, show: pmt.show });
            
         data = { ...data, authorizationUrl: pmt.data.authorization_url, ...pmt.data};
         res.status(pmt.status).send(pmt);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }

   static async walletCallbackUrl (req, res, next) {
      console.log(`Trying to complete the spayment`)
      try {
         let { success, message, amount, verified } = req.body;
         amount = parseFloat(amount);
         if (!success) {
            res.status(200)
               .send({
                  success: false,
                  message: message ? message : 'Couldnt complete payment',
               });
            return;
         }
         const user =  await db[process.env.DEFAULT_DB].models.User.findOne({
            attributes: ['id'],
            where: {email: verified?.customer?.email, isEnabled: true, isLocked: false}
         });
         const walletService = new CustomerWalletService;
         const getWallet = await walletService.getWallet({userId: user.id});
         if(!getWallet || !getWallet.success) 
            throw new AppError(getWallet.message||`Wallet not found`, getWallet.line||__line, getWallet.file||__path.basename(__filename), { name: getWallet.name, status: getWallet.status, show: getWallet.show })
         
         const updateBalance = await walletService.updateBalance({userId: user.id, amount});
         if(!updateBalance || !updateBalance.success) 
            throw new AppError(updateBalance.message||`Wallet not found`, updateBalance.line||__line, updateBalance.file||__path.basename(__filename), { name: updateBalance.name, status: updateBalance.status, show: updateBalance.show })
         
         res.status(updateBalance.status).send(updateBalance);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async orderCallbackUrl (req, res, next) {
      console.log(`Trying to complete the payment`)
      try {
         let { success, message, amount, verified } = req.body;
         amount = parseFloat(amount);
         if (!success) {
            res.status(200)
               .send({ success: false, message: message ? message : 'Couldnt complete payment',});
            return;
         }
         const user =  await db[process.env.DEFAULT_DB].models.User.findOne({
            attributes: ['id'],
            where: {email: verified?.customer?.email, isEnabled: true, isLocked: false}
         });
         const orderService = new OrderService;
         // const walletService = new CustomerWalletService;
         // const getWallet = await orderService.getWallet({userId: user.id});
         // if(!getWallet || !getWallet.success) 
         //    throw new AppError(getWallet.message||`Wallet not found`, getWallet.line||__line, getWallet.file||__path.basename(__filename), { name: getWallet.name, status: getWallet.status, show: getWallet.show })
         
         const updateBalance = await orderService.updateOrderStatus({orderId: verified.metadata.assetId, userId: user.id, amount, status: verified.status});
         if(!updateBalance || !updateBalance.success) 
            throw new AppError(updateBalance.message||`Wallet not found`, updateBalance.line||__line, updateBalance.file||__path.basename(__filename), { name: updateBalance.name, status: updateBalance.status, show: updateBalance.show })
         
         res.status(updateBalance.status).send(updateBalance);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
   static async recommended (req, res, next) {
      console.log(`Trying to complete the payment`)
      try {
         const productService = new ProductService;
         const recommended = await productService.getRecommendedVendors({ params: req.params, query: req.query });
         if(!recommended || !recommended.success) 
            throw new AppError(recommended.message||`Wallet not found`, recommended.line||__line, recommended.file||__path.basename(__filename), { name: recommended.name, status: recommended.status, show: recommended.show })
         
         res.status(recommended.status).send(recommended);
      } catch (error) {
         console.error(error.message);
         return next(
            new AppError(
               error.message
               , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show })
         );
      }
   }
}

module.exports = UserController;