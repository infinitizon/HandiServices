const AppError = require('../../config/apiError')
const db = require("../../database/models");
const genericRepo = require('../../repository');


class AuditLogsService {
   static getAllAuditLogs = async ({auth, query, paginate}, next) => {
      try {
         const {tenantId, userId} = auth
         const {search} = query
         const auditLogs = await genericRepo
           .setOptions("AuditLogs", {
             condition: {
               ...(search && {[db.Sequelize.Op.or]: [
                  {commonType:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}},
                  {action:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}}
               ]}),
               tenantId
             },
             inclussions: [
               {
                 model: db[process.env.DEFAULT_DB].models.BulkTransactionLogs,
                 required: false
               },
               {
                  model: db[process.env.DEFAULT_DB].models.User,
                  as: 'Maker',
                  attributes: [
                    'id', 'firstName', 'lastName', 'email'
                  ],
                  where: {
                     ...(search && {[db.Sequelize.Op.or]: [
                        {firstName:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}},
                        {lastName:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}},
                        {email:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}}
                     ]})
                  },
                  required: false
               },
               {
                  model: db[process.env.DEFAULT_DB].models.User,
                  as: 'Checker',
                  attributes: [
                     'id', 'firstName', 'lastName', 'email'
                  ],
                  where: {
                     ...(search && {[db.Sequelize.Op.or]: [
                        {firstName:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}},
                        {lastName:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}},
                        {email:{ [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'ilike':'like']]: `%${search}%`}}
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
                  model: db[process.env.DEFAULT_DB].models.BulkTransactionLogs,
                  required: false
               },
               {
                  model: db[process.env.DEFAULT_DB].models.User,
                  as: 'Maker',
                  attributes: [
                  'id', 'firstName', 'lastName', 'email'
                  ]
               },
               {
                  model: db[process.env.DEFAULT_DB].models.User,
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
