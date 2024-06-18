const moment = require("moment");
const xlsx = require("xlsx");
const db = require("../../database/models");
const genericRepo = require("../../repository");
const { abortIf } = require("../utils/responder");
const httpStatus = require("http-status");
const AppError = require("../../config/apiError");
const CloudObjUploadService  = require('./cloud-obj-upload.service');
const helper = require("../utils/helper");
const Pagination = require('../utils/pagination')

class TxnService {
   async createTransaction ({ txnBody, transaction, returning = false }) {
      const t = transaction ? transaction : await db[process.env.DEFAULT_DB].transaction();
      try {
         let { txnHeader, txnDetails } = txnBody
         let {callbackParams} = txnHeader
         let detAmount = 0;
         for (let item of txnDetails) {
            detAmount += item['amount'];
         }
         abortIf(detAmount !== txnHeader.amount, httpStatus.BAD_REQUEST, 'Transaction details amount must sum up to transactions header amount')
         txnHeader.TxnDetails = txnDetails
         callbackParams = (typeof callbackParams === 'string') ? JSON.parse(callbackParams) : callbackParams
         txnHeader.commonId = callbackParams.assetId
         txnHeader.commonType = callbackParams.module == 'wallet'?'product':callbackParams.module;
         const createTxnHeader = await genericRepo
            .setOptions("TxnHeader", {
               data: txnHeader,
               inclussions: [
                  {
                  model: db[process.env.DEFAULT_DB].models.TxnDetail
                  }
               ],
               transaction: t,
            })
            .create();

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, ...(returning && {TxnHeader: createTxnHeader}) };
      } catch (error) {
         // t.rollback();
         console.log(error.message);
         return new AppError(error.message, error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }

   async getAllTransactions ({query, role, userId, tenantId, next, }) {
      try {
         let condition, userInclussionCondition;
         /**
          * if no startDate pick 30 days ago
          */
         if (!query.startDate) {
         const today = moment();
         query.startDate = moment(today).subtract(30, "days");
         }
         /**
          * if no endDate pick today
          */
         /**
          * condition for Join
          */
         if (userId) {
         userInclussionCondition = {
            id: userId,
         };
         }

         if (!query.endDate) {
            query.endDate = moment();
         }
         condition = {
            createdAt: {
               [db.Sequelize.Op.between]: [query.startDate, query.endDate],
            },
         };
         if (query.search) {
            condition = {
               ...condition,
               [db.Sequelize.Op.or]: [
                  {
                  gatewayReference: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${query.search}%` },
                  },
                  {
                  reference: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${query.search}%` },
                  },
               ],
            };
         }
         const inclussions = [
            {
               model: db[process.env.DEFAULT_DB].models.User,
               where: {
                  ...(role === "CUSTOMER" && userInclussionCondition),
               },
               attributes: ["email", "firstName"],
               // ...(role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN' &&{include: [
               //   {
               //     model: db[process.env.DEFAULT_DB].models.TenantUserRole,
               //     where: {
               //       ...(tenant_id &&
               //         (role === "SUPER_ADMIN" || role === "TENANT_ADMIN") && {
               //           tenant_id,
               //         }),
               //     },
               //   },
               // ]}),
            },
            {
               model: db[process.env.DEFAULT_DB].models.TxnHeader,
               ...(role === 'TENANT_ADMIN' && {where: {
                  tenantId
               }}),
               attributes: {exclude: [ 'updatedAt', 'deletedAt' ]},
               // include: [{
               //    model: db[process.env.DEFAULT_DB].models.Product,
               //    attributes: ['title', 'summary'],
               //    include: [{
               //       model: db[process.env.DEFAULT_DB].models.Media,
               //       attributes: ['link'],
               //       required: false
               //    }],
               // }]
            },
         ]
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const txns = await db[process.env.DEFAULT_DB].models.TxnDetail.findAndCountAll({
            attributes: ["amount", "userId", "currency", "id", "status", "createdAt"],
            include: inclussions,
            where: condition,
            orderBy: [['createdAt', 'DESC']],
            limit, offset
         })
         return { success: true, status: 200, message: `Transaction fetched successfully`, total: txns.count, page: query.page, perPage: query.perPage, data: txns.rows};
      } catch (error) {
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

   async getOneTransaction ({ transactionId, userId, next }) {
      try {
         let trxnHeaderCondition;
         const condition = { id: transactionId, };
         if (userId) {
            trxnHeaderCondition = {
               userId,
            };
         }
         const transaction = await genericRepo
         .setOptions("TxnDetail", {
            selectOptions: [
               "id",
               "description",
               "currency",
               "unit",
               "amount",
               "status",
               "txnHeaderId",
               "createdAt"
            ],
            condition,
            inclussions: [
               {
               model: db[process.env.DEFAULT_DB].models.TxnHeader,
               ...(userId && { where: trxnHeaderCondition }),
               attributes: [
                  "id",
                  "reference",
                  "gatewayReference",
                  "currency",
                  "description",
                  "amount",
                  "status",
                  "source",
                  "channel",
                  "module"
               ],
               include: [
                  {
                     model: db[process.env.DEFAULT_DB].models.Asset,
                     attributes: ["name", "subTitle", "description", "sharePrice"],
                     include: [{
                     model: db[process.env.DEFAULT_DB].models.Media,
                     attributes: ['name', 'type', 'link']
                     }]
                  }
               ]
               }
            ],
         })
         .findOne();
         return transaction;
      } catch (error) {
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

   async uploadTransaction ({ transaction, proofOfPayment, auth, originalUrl, action}, next) {
      const t = await db[process.env.DEFAULT_DB].transaction();
      try {
         const {userId, tenantId} = auth
         let {txnHeader, txnDetails} = transaction
         let detAmount = 0;
         for (let item of txnDetails) {
            detAmount += item['amount'];
         }
         abortIf(detAmount !== txnHeader.amount, httpStatus.BAD_REQUEST, 'Transaction details amount must sum up to transactions header amount')
         txnHeader.TxnDetails = txnDetails
         txnHeader.reference = txnHeader?.reference ? txnHeader?.reference : `BLK_${helper.generateOTCode(10, true)}`;
         txnHeader.status = `pending_approval`;
         
         const txnHead = await genericRepo
         .setOptions("TxnHeader", {
            data: txnHeader,
            inclussions: [
               {
               model: db[process.env.DEFAULT_DB].models.TxnDetail
               }
            ],
            transaction: t,
         })
         .create();
         if(proofOfPayment){
            const uploaderService = new CloudObjUploadService({service: 'cloudniary'});
            const uploaded = await uploaderService.upload(proofOfPayment.tempFilePath);
            if(!uploaded || !uploaded.success)
               throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
            
            if(uploaded.secure_url) {
               await txnHead.createMedium({
                     name: uploaded.original_filename,
                     type: uploaded.format,
                     link: uploaded.secure_url,
                     size: uploaded.bytes,
                     commonType: 'txn_headers',
                     commonId: txnHead.id
               });
            }
         }
         
         await txnHead.createAuditLog({
            maker: userId,
            url: originalUrl,
            action,
            tenantId,
            commonType: 'txn_headers',
            commonId: txnHead.id
            }, {transaction: t})
         t.commit();
         return txnHead;
      } catch (error) {
         t.rollback();
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

   async updateTransacionHeader () {}

   async downloadUploadTemplate (tenantId, next) {
      try {
         const workbook = xlsx.utils.book_new();
         // get all customers with role = CUSTOMERS
         console.log("HELPPP");
         let users = await genericRepo
         .setOptions("TenantUserRole", {
            selectOptions: ["userId"],
            condition: {
               tenantId,
            },
            inclussions: [
               {
               model: db[process.env.DEFAULT_DB].models.Role,
               where: {
                  name: "CUSTOMER",
               },
               attributes: ["id"],
               },
               {
               model: db[process.env.DEFAULT_DB].models.User,
               attributes: [
                  "id",
                  "first_name",
                  "last_name",
                  "middle_name",
                  "email",
               ],
               },
            ],
         })
         .findAll();
         let jsonObject = await TxnService.generateUserObject(users);
         let sheet = xlsx.utils.json_to_sheet(jsonObject);
         xlsx.utils.book_append_sheet(workbook, sheet, "Details Template");
         let data = xlsx.write(workbook, { type: "buffer", bookType: "xlsx", bookSST: false, });
         return data;
      } catch (error) {
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

   async getAllPendingBulkTransactions ({ query={}}) {
      try{
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const txnHistory = await db[process.env.DEFAULT_DB].models.TxnHeader.findAndCountAll({
         attributes: [ 'id', 'amount', 'reference', 'currency', 'status', 'createdAt' ],
         include: [
            {
               model: db[process.env.DEFAULT_DB].models.AuditLogs,
            },
         ],
         limit, offset,
         order: [['createdAt', 'DESC']]
         });
         return {success: true, status: 200, message: `Transactions retrieved successfully`, count: txnHistory.count, data: txnHistory.rows }
      }catch(error){
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getTxnWtLogDetails ({ headerId, query={}}) {
      try{
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const txnHistory = await db[process.env.DEFAULT_DB].models.TxnDetail.findAndCountAll({
         attributes: [ 'amount', 'createdAt' ],
         include: [
            {
               model: db[process.env.DEFAULT_DB].models.TxnHeader,
               attributes: [ 'amount', 'reference', 'currency', 'status', 'createdAt' ],
               where: {id: headerId}
            },
            {
               model: db[process.env.DEFAULT_DB].models.User,
               attributes: [ 'firstName', 'middleName', 'lastName', 'phone', 'email' ],
            },
         ],
         limit, offset
         })
         return {success: true, status: 200, message: `Transactions retrieved successfully`, count: txnHistory.count, data: txnHistory.rows }
      }catch(error){
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }

   async getOnePendingBulkTransactions ({id, auth, query}) {
      try{
         console.log(auth, query);
         let inclussions = [
         {
            model: db[process.env.DEFAULT_DB].models.TxnHeader,
            attributes: [
               'amount', 'reference', 'currency', 'channel', 'module'
            ],
            include: [
               {
               model: db[process.env.DEFAULT_DB].models.Media,
               attributes: ['link']
               },
               {
               model: db[process.env.DEFAULT_DB].models.TxnDetail,
               attributes: ['userId', 'amount', 'description', 'status' ],
               include: [
                  {
                     model: db[process.env.DEFAULT_DB].models.User,
                     attributes: ['email']
                  }
               ],
               }
            ]
         }
         ]
         const pendingBulkTransaction = await genericRepo.setOptions('AuditLogs', {
         condition: {
            id
         },
         inclussions,
         }).findOne()
         return pendingBulkTransaction
      }catch(error){
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }



   async approveBulkTransactions ({status, auth, id}) {
      const t = await db[process.env.DEFAULT_DB].transaction();
      try{
         const { userId } = auth
         const mapping = {
            approved: 'success',
            rejected: 'failed'
         }
         const TxnHeader = await db[process.env.DEFAULT_DB].models.TxnHeader.findByPk(id, {
            include: [
               {model: db[process.env.DEFAULT_DB].models.AuditLogs}
            ]
         });        
         const bulkTransaction = await TxnHeader.AuditLogs[0];
         
         abortIf(!bulkTransaction, httpStatus.BAD_REQUEST, 'Audit log does not exist.')
         //get all transactions 
         await genericRepo.setOptions('TxnHeader', {
            condition: {
               id: bulkTransaction.commonId
            },
            changes: {
               status: mapping[status]
            },
            transaction: t
         }).update()
         await genericRepo.setOptions('TxnDetail', {
            condition: {
               txnHeaderId: bulkTransaction.commonId
            },
            changes: {
               status: mapping[status]
            },
            transaction: t
         }).update()
         const bulkLogs = await genericRepo.setOptions('AuditLogs', {
            condition: {
               id: bulkTransaction.id
            },
            changes: {
               status,
               checker: userId
            },
            transaction: t,
            returning: true
         }).update()

         t.commit();
         return { success: true, status: 200, message: `Successfully ${status} bulk transaction`, data: bulkLogs[1][0] }
      }catch(error){
         t.rollback()
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         );
      }
   }

   generateUserObject (users) {
      let arr = [];
      if(users.length < 1){
         arr.push({
         "FIRST NAME": '',
         "MIDDLE NAME": '',
         "LAST NAME": '',
         EMAIL: '',
         userId: '',
         AMOUNT: "",
         ASSET: "",
         DESCRIPTION: "",
         CURRENCY: "",
         });
      }else{
         for (let item of users) {
         arr.push({
            "FIRST NAME": item.User.dataValues.first_name,
            "MIDDLE NAME": item.User.dataValues.middle_name,
            "LAST NAME": item.User.dataValues.last_name,
            EMAIL: item.User.email,
            userId: item.User.id,
            AMOUNT: "",
            ASSET: "",
            DESCRIPTION: "",
            CURRENCY: "",
         });
         }
      }
      return arr;
   }

   generateBulkTxnDetails (arr, txnHeaderId) {
      const result = []
      for(let item of arr){
         result.push({
         txnHeaderId,
         userId: item.userId,
         currency: "NGN",
         amount: item.AMOUNT,
         })
      }
      return result
   }
}

module.exports = TxnService;
