const { postgres, Sequelize } = require('../../database/models');
const Pagination = require('../utils/pagination')
const AppError = require("../../config/apiError");

class ChatService {
   async startSession({ pId, sessionId, userId, message, timestamp, transaction }) {
      const t = transaction ?? await postgres.transaction()
      try {
         const created = await postgres.models.Order.create({
            pId, sessionId, userId, message, ...(timestamp && {createdAt: new Date(timestamp)})
         }, { transaction: t });

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Order created successfully`, data: created }
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async createChat({ pId, sessionId, userId, message, timestamp, transaction }) {
      const t = transaction ?? await postgres.transaction();
      try {
         const created = await postgres.models.ChatMessage.create({
            pId, sessionId, userId, message, ...(timestamp && {createdAt: new Date(timestamp)})
         }, { transaction: t });

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Chat created successfully`, data: created };
      } catch (error) {
         console.error(error.message);
         // transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async updateChat({ order, transaction }) {
      const t = transaction ?? await postgres.transaction();
      try {
         const existingOrder = await postgres.models.OrderItem.findByPk(order.orderId);
         if(!existingOrder)
            throw new AppError(`Order with id: ${order.orderId} does not exist`, __line, __path.basename(__filename), { status: 404, show: true });

         await existingOrder.update({value: order.value}, { transaction: t })
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Order updated successfully` }
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getOrder({ orderId, }) { 
      try {
         let order = await postgres.models.Order.findByPk(orderId, {
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            duplicating: false,
            include: [
               {
                  model: postgres.models.OrderItem,
                  duplicating: false,
                  attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
               },
            ], 
         });
         return { success: true, status: 200, message: `Orders fetched successfully`, data: order }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getTenantSessions({ tenantId }) { 
      try {
         let sessions = await postgres.models.ChatSession.findAll({
            include: [
               {
                  model: postgres.models.Order,
                  attributes: ['id'],
                  where: {status: {[Sequelize.Op.ne]: 'completed'}}
               },
               {
                  model: postgres.models.User,
                  as: 'Customer',
                  attributes: ['id', 'firstName', 'lastName'],
                  include: [{
                     model: postgres.models.Media, required: false,
                     where: {objectType: 'avatar'}
                  },]
               },
               {
                  model: postgres.models.User,
                  as: 'Admin',
                  attributes: ['id', 'firstName', 'lastName'],
               },
            ],
            where: { ...(tenantId && { tenantId }), },
            order: [['updatedAt', 'DESC']],
         });
         return { success: true, status: 200, message: `Sessions fetched successfully`, data: sessions }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async claimSession({ auth, session, transaction }) { 
      const t = transaction ?? await postgres.transaction()
      try {
         let sessions = null
         let sesn = await postgres.models.ChatSession.findOne({where: { sessionId: session.sessionId }, transaction: t });
         if(auth.role === 'PROVIDER_ADMIN') {
            if(sesn.claim) 
               throw new AppError(`Chat session already claimed by `, __line, __path.basename(__filename), { status: 409, show: true });
            sessions = await sesn.update({
               claim: auth.userId
            }, { transaction: t });
         }
         if(auth.role === 'CUSTOMER') {
            if(!sesn) {
               sessions = await postgres.models.ChatSession.create(
                  { userId: auth.userId, tenantId: session.tenantId, sessionId: session.sessionId},
                  { transaction: t }
               );
            } else {
               sessions = sesn;
            }
         }
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Sessions fetched successfully`, data: sessions }
      } catch (error) {
         console.log(error.message)
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async chatHistory({ sessionId }) { 
      try {
         // const { limit, offset } = Pagination.getPagination(query?.page, query?.perPage);
         let order = await postgres.models.ChatMessage.findAll({
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            duplicating: false,
            include: [
               {
                  model: postgres.models.User,
                  duplicating: false,
                  attributes: ['id', 'firstName', 'lastName'],
                  include: [{
                     model: postgres.models.Media,
                     duplicating: false, required: false,
                     where: {objectType: 'avatar'}
                  },],
               },
            ],
            where: { ...(sessionId && { sessionId }), },
            // limit, offset,
         });
         return { success: true, status: 200, message: `Orders fetched successfully`, data: order }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
}
module.exports = ChatService;
