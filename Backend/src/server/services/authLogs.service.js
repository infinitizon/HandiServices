const AppError = require('../../config/apiError')
const { postgres, Sequelize } = require("../../database/models");
const genericRepo = require('../../repository');


class AuditLogsService {
   static getAllAuditLogs = async ({auth, query, paginate}, next) => {
      try {
         const {tenantId, userId} = auth
         const {search} = query
         const auditLogs = await genericRepo
           .setOptions("AuditLogs", {
             condition: {
               ...(search && {[Sequelize.Op.or]: [
                  {commonType:{ [Sequelize.Op.iLike]: `%${search}%`}},
                  {action:{ [Sequelize.Op.iLike]: `%${search}%`}}
               ]}),
               tenantId
             },
             inclussions: [
               {
                 model: postgres.models.BulkTransactionLogs,
                 required: false
               },
               {
                  model: postgres.models.User,
                  as: 'Maker',
                  attributes: [
                    'id', 'firstName', 'lastName', 'email'
                  ],
                  where: {
                     ...(search && {[Sequelize.Op.or]: [
                        {firstName:{ [Sequelize.Op.iLike]: `%${search}%`}},
                        {lastName:{ [Sequelize.Op.iLike]: `%${search}%`}},
                        {email:{ [Sequelize.Op.iLike]: `%${search}%`}}
                     ]})
                  },
                  required: false
               },
               {
                  model: postgres.models.User,
                  as: 'Checker',
                  attributes: [
                     'id', 'firstName', 'lastName', 'email'
                  ],
                  where: {
                     ...(search && {[Sequelize.Op.or]: [
                        {firstName:{ [Sequelize.Op.iLike]: `%${search}%`}},
                        {lastName:{ [Sequelize.Op.iLike]: `%${search}%`}},
                        {email:{ [Sequelize.Op.iLike]: `%${search}%`}}
                     ]})
                  },
                  required: false
               }
             ],
             paginateOptions: paginate
           }).findAllWithPagination();
         return auditLogs;
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

   static getOneAuditLog = async ({id, auth}, next) => {
      try{
         const {userId, tenantId} = auth
         const auditLogs = await genericRepo.setOptions('AuditLogs', {
            condition: {id, tenantId},
            inclussions: [
               {
                  model: postgres.models.BulkTransactionLogs,
                  required: false
               },
               {
                  model: postgres.models.User,
                  as: 'Maker',
                  attributes: [
                  'id', 'firstName', 'lastName', 'email'
                  ]
               },
               {
                  model: postgres.models.User,
                  as: 'Checker',
                  attributes: [
                     'id', 'firstName', 'lastName', 'email'
                  ]
               }
            ]
         }).findOne()
         return auditLogs
      }catch(error){
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

   static updateAuditLog = async () => {}
}
module.exports = AuditLogsService;
