const {TransactionService} = require('../services')
const { successResponse, abortIf, downloadFile} = require('../utils/responder')
const AppError = require('../../config/apiError')
const httpStatus = require('http-status')
class TxnController {
//    createTransaction = catchAsync(async(req, res, next)=>{
      
//    })

   static async getAllTransactions (req, res, next) {
      /**
      * #swagger.description = 'To get All Transactions'
      * #swagger.responses[200] = {
         description: 'User RefCodes retrieved successfully',
         schema: {
            $status: 200,
            $success: true,
            $message: 'RefCodes retrieved successfully',
            $data: {
               $data: [
                  {
                     $amount: 5000,
                     $user_id: "532dcf16-ba6b-43ec-a5b5-f056836f39d7",
                     $currency: "NGN",
                     $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                     $User: {
                        $email: "riyetayo@gmail.com",
                        $first_name: "ADERIYE"
                     },
                     $TxnHeader: {
                        $asset_id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                        $reference: "BLK_YEIJNXWU",
                        $source: "eipo",
                        $channel: "online",
                        $description: "",
                        $currency: "NGN",
                        $Asset: {
                           $name: "MTN",
                           $description: "mtn shares"
                        }
                     }
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
         const { role, ...rest } = res.locals.user
         const { startDate, endDate, tenantId } = req.query
         if(startDate || endDate ) {
            if(!startDate || !endDate) 
               throw new AppError(`Startdate or enddate missin`, __line,  __path.basename(__filename), { status: 500, show: true});
         }
         // eslint-disable-next-line no-underscore-dangle
         const txns = await (new TransactionService()).getAllTransactions({query: req.query,
            role,
            userId: rest.userId,
            tenantId: tenantId || rest.tenantId, 
            next
         });
         res.status(txns.status).json(txns)
         res.locals.resp = txns;
      } catch (error) {
         console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
      }
         
   }

   static async getOneTransaction (req, res, next) {
   /**
      * #swagger.description = 'Admins and Users can view one transaction'
      * #swagger.responses[200] = {
         description: 'User RefCodes retrieved successfully',
         schema: {
            $status: 200,
            $success: true,
            $message: 'RefCodes retrieved successfully',
            $data: {
                     $amount: 5000,
                     $status: "success",
                     $currency: "NGN",
                     $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                     $txnHeaderId: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                     $TxnHeader: {
                        $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                        $reference: "BLK_YEIJNXWU",
                        $gatewayReference: "",
                        $amount: 10000,
                        $status: 10000,
                        $source: "eipo",
                        $channel: "online",
                        $description: "",
                        $module: "",
                        $currency: "NGN",
                        $Asset: {
                           $name: "MTN",
                           $description: "mtn shares"
                        },
                        $Media: [
                           {
                              $name: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg",
                              $type: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg",
                              $link: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg"
                           }
                        ]
                     }
               
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
         const { role, ...rest } = res.locals.user
         console.log(role);
         const { id: transactionId } = req.params
         const oneTransaction = await (new TransactionService()).getOneTransaction({
            transactionId,
            userId: req.query.userId||rest.userId,
            next
         })
         abortIf(!oneTransaction, httpStatus.NOT_FOUND, 'Transaction with this id does not exist.')
         return successResponse(req, res, oneTransaction)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static async uploadTransaction (req, res, next) {
      /**
         * #swagger.description = 'Admins can upload transactions via excel sheets'
         * #swagger.parameters['sheet'] = {
              in: 'formData',
              type: 'file',
              required: 'true',
              description: 'Upload Excel sheet',
         }
         * *#swagger.responses[200] = 
            {
               description: 'File uploaded successfully',
               "code": 200,
               "success": true,
               "data": {
                  "txnHeader": {
                     "amount": 4000,
                     "paymentMethod": "online",
                     "gateway": "paystack",
                     "id": "7ad9054c-0a59-47e6-a9af-0a1e93e1429f",
                     "asset_quantity": 1000,
                     "transAmount": 1000,
                     "description": "New deposit for ZMMF2",
                     "type": "debit",
                     "asset_type": "FUND",
                     "fundName": "ZMMF2",
                     "orderBase": "VALUE",
                     "transType": "SUBSCRIPTION",
                     "portfolioId": 60847,
                     "portfolioName": "0000000914",
                     "redirect_url": "https://ashy-mud-0c13c8103.3.azurestaticapps.net/dashboard/investments/investin/investments ",
                     "currency": "NGN",
                     "assetName": "ZMMF2",
                     "post_url": "https://investnaija.azurewebsites.net/api/v1/investin/funds/post-transaction",
                     "callback_params": {
                        "module": "invest",
                        "resident": true,
                        "tenor": "2",
                        "asset_id": "44db193c-4e18-4635-b85c-958a25bc15a7",
                        "gateway_id": "b18f082a-dee3-4816-8297-a9024e4679a9",
                        "saveCard": false
                     },
                     "gatewayEndpoints": "https://investnaija.azurewebsites.net/api/v1/3rd-party-services/gateway?modules=invest&id=7ad9054c-0a59-47e6-a9af-0a1e93e1429f",
                     "gateway_id": "b18f082a-dee3-4816-8297-a9024e4679a9",
                     "channel": "paystack",
                     "user_id": "f32dcf16-ba6b-43ec-a5b5-f056836f39d9",
                     "tenant_id": "77fa1eed-bbc8-4ae7-9237-0bec880b513d",
                     "reference": "4V1RO05-E4GQTH2HOABL",
                     "TxnDetails": [
                        {
                           "user_id": "f32dcf16-ba6b-43ec-a5b5-f056836f39d9",
                           "type": "debit",
                           "amount": 4000,
                           "currency": "NGN",
                           "description": "New deposit for ZMMF2"
                        }
                     ]
                  },
                  "txnDetails": [
                     {
                     "user_id": "f32dcf16-ba6b-43ec-a5b5-f056836f39d9",
                     "type": "debit",
                     "amount": 4000,
                     "currency": "NGN",
                     "description": "New deposit for ZMMF2"
                     }
                  ],
                  "callback_params": {
                     "module": "invest",
                     "resident": true,
                     "tenor": "2",
                     "asset_id": "44db193c-4e18-4635-b85c-958a25bc15a7",
                     "gateway_id": "b18f082a-dee3-4816-8297-a9024e4679a9",
                     "saveCard": false
                  },
                  "reference": "4V1RO05-E4GQTH2HOABL",
                  "authorization_url": "https://checkout.paystack.com/st46fi1nhkh0jqe"
               },
               "message": "Record saved successfully"
            }
         */
         try{
            const auth = res.locals.user
            // const sheet = req.files?.sheet
            const proofOfPayment = req.files?.proofOfPayment
            const updload = await (new TransactionService()).uploadTransaction({ transaction: req.body, proofOfPayment, auth, originalUrl: req.originalUrl, action: "bulk-txn-upload"}, next)
            return successResponse(req, res, updload)
         }catch(error){
            return next(
               new AppError(
                   error.message
                   , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
           );
         }
   }

   static async downloadTemplate (req, res, next) {
      /**
         * #swagger.description = 'Admins can download transactions templates in excel sheets'
         * #swagger.responses[200] = {
          }
         */
      try{
         const {tenantId} = res.locals.user
         const download = await (new TransactionService()).downloadUploadTemplate(tenantId, next)
         return downloadFile(
            download,
            res,
            "transaction_template.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
         );
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static async getAllTxnHdrWtLogs (req, res, next) {
      /**
      * #swagger.description = 'Admins can view pending bulk transactions'
      * #swagger.responses[200] = {
         description: 'Admins can view pending bulk transactions',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Admins can view pending bulk transactions',
            $data: 
                  {     
                     $rows: 
                     [
                        {
                           $amount: 5000,
                           $commonId: "9d0409e5-19f9-460d-9bba-9e8f39e1c2a8",
                           $commonType: "txn_headers",
                           $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                           $status: "pending",
                           $checker: "null",
                           $action: "bulk-txn-upload",
                           $url: "/api/v2/transactions/bulk/upload-transactions",
                           $tenantId: "77fa1eed-bbc8-4ae7-9237-0bec880b513d",
                           $data: null,
                           $TxnHeader: {
                              $reference: "BLK_YEIJNXWU",
                              $amount: 10000,
                              $channel: "online",
                              $module: "",
                              $currency: "NGN",
                              $Media: [
                                 {
                                    $link: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg"
                                 }
                              ],
                              $TxnDetails: [
                                 {
                                    $user_id: "f32dcf16-ba6b-43ec-a5b5-f056836f39d7",
                                    $amount: 10000,
                                    $description: "online",
                                    $status: "pending",
                                    $User: 
                                       {
                                          $email: "riyetayo@gmail.com"
                                       },
                                 }
                              ]
                           }
                        }
                     
                     ]
                  }
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
         const auth = res.locals.user
         const txns = await (new TransactionService()).getAllPendingBulkTransactions({auth, query: req.query})
         if(!txns || !txns.status)
            throw new AppError(txns.message, txns.line||__line, txns.file||__path.basename(__filename), { status: txns.status||404, show: txns.show });
      
         res.status(txns.status).json(txns)
         res.locals.resp = txns;
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }
   static async getTxnWtLogDetails (req, res, next) {
      /**
      * #swagger.description = 'Admins can view pending bulk transactions'
      * #swagger.responses[200] = {
         description: 'Admins can view pending bulk transactions',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Admins can view pending bulk transactions',
            $data: 
                  {     
                     $rows: 
                     [
                        {
                           $amount: 5000,
                           $commonId: "9d0409e5-19f9-460d-9bba-9e8f39e1c2a8",
                           $commonType: "txn_headers",
                           $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                           $status: "pending",
                           $checker: "null",
                           $action: "bulk-txn-upload",
                           $url: "/api/v2/transactions/bulk/upload-transactions",
                           $tenantId: "77fa1eed-bbc8-4ae7-9237-0bec880b513d",
                           $data: null,
                           $TxnHeader: {
                              $reference: "BLK_YEIJNXWU",
                              $amount: 10000,
                              $channel: "online",
                              $module: "",
                              $currency: "NGN",
                              $Media: [
                                 {
                                    $link: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg"
                                 }
                              ],
                              $TxnDetails: [
                                 {
                                    $user_id: "f32dcf16-ba6b-43ec-a5b5-f056836f39d7",
                                    $amount: 10000,
                                    $description: "online",
                                    $status: "pending",
                                    $User: 
                                       {
                                          $email: "riyetayo@gmail.com"
                                       },
                                 }
                              ]
                           }
                        }
                     
                     ]
                  }
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
         const auth = res.locals.user
         const {id: headerId} = req.params
         const query = req.query
         const txns = await (new TransactionService()).getTxnWtLogDetails({headerId, auth, query})
         if(!txns || !txns.status)
            throw new AppError(txns.message, txns.line||__line, txns.file||__path.basename(__filename), { status: txns.status||404, show: txns.show });
      
         res.status(txns.status).json(txns)
         res.locals.resp = txns;
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static async getOneTxnHdrWtLogs (req, res, next) {
      /**
      * #swagger.description = 'Admins can view pending bulk transactions'
      * #swagger.responses[200] = {
         description: 'Admins can view pending bulk transactions',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Admins can view pending bulk transactions',
            $data: 
                  {     
                     
                        
                           $amount: 5000,
                           $commonId: "9d0409e5-19f9-460d-9bba-9e8f39e1c2a8",
                           $commonType: "txn_headers",
                           $id: "6446ff8a-f3d0-463f-9f2f-5d6640a83b3e",
                           $status: "pending",
                           $checker: "null",
                           $action: "bulk-txn-upload",
                           $url: "/api/v2/transactions/bulk/upload-transactions",
                           $tenantId: "77fa1eed-bbc8-4ae7-9237-0bec880b513d",
                           $data: null,
                           $TxnHeader: {
                              $reference: "BLK_YEIJNXWU",
                              $amount: 10000,
                              $channel: "online",
                              $module: "",
                              $currency: "NGN",
                              $Media: [
                                 {
                                    $link: "https://res.cloudinary.com/dsavh0wlc/image/upload/v1700238139/p6barlpbv2oa6zd4frs9.jpg"
                                 }
                              ],
                              $TxnDetails: [
                                 {
                                    $user_id: "f32dcf16-ba6b-43ec-a5b5-f056836f39d7",
                                    $amount: 10000,
                                    $description: "online",
                                    $status: "pending",
                                    $User: 
                                       {
                                          $email: "riyetayo@gmail.com"
                                       },
                                 }
                              ]
                           }
                        
                     
                  }
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
         const auth = res.locals.user
         const {id} = req.params
         const query = req.query
         const results = await (new TransactionService()).getOnePendingBulkTransactions({id, auth, query}, next)
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static async approveBulkTransactions (req, res, next) {
      /**
      * #swagger.description = 'Successfully approved bulk transaction'
      * #swagger.responses[200] = {
         description: 'Successfully approved bulk transaction',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {     
                     $message:"Successfully approved bulk transaction" 
                  }
         }
      }
         */
      try{
         const auth = res.locals.user
         const { status } = req.body
         const {id} = req.params
         const results = await (new TransactionService()).approveBulkTransactions({status, auth, id}, next)
         if(!results || !results.status)
            throw new AppError(results.message, results.line||__line, results.file||__path.basename(__filename), { status: results.status||404, show: results.show });
      
         res.status(results.status).json(results)
         res.locals.resp = results;
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }
}

module.exports = TxnController;