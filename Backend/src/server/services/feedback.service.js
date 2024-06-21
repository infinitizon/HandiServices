const AppError = require('../../config/apiError')
const db = require('../../database/models');
const Pagination = require('../utils/pagination')

class FeedbackService {
   async getAllFeedback ({ query }) {
      try {
         const { userId, issue, description } = query;
         
         // Define a filter object based on provided query parameters
         const reportFilter = {
            where: {
                  ...(userId && {userId: { [db.Sequelize.Op.eq]: userId }} ), 
                  ...(issue && {issue: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: issue }} ),
                  ...(description && {description: { [db.Sequelize.Op[process.env.DEFAULT_DB=='postgres'?'iLike':'like']]: description }} )
            },
            include: [{
                  model: db[process.env.DEFAULT_DB].models.User,
                  attributes: ['id', 'firstName', 'lastName'],
            }],
         };

         // Remove undefined properties from the filter object
         Object.keys(reportFilter.where).forEach((key) =>
               reportFilter.where[key] === undefined && delete reportFilter.where[key]
         );

         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         const reports = await db[process.env.DEFAULT_DB].models.Feedback.findAndCountAll({
               where: reportFilter.where,
               include: reportFilter.include,
               orderBy: [['createdAt', 'DESC']],
               limit, offset
         });

         return { success: true, status: 200, message: `Feedbacks fetched successfully`, total: reports.count, data: reports.rows};
      } catch (error) {
         console.error(error.message);
         return new AppError(
            error.message
            , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
   async getFeedback ({ id }) {
      try {
         
         const report = await db[process.env.DEFAULT_DB].models.Feedback.findOne({
            where: {id},
            include:  [{
                model: db[process.env.DEFAULT_DB].models.User,
                attributes: ['id', 'firstName', 'lastName'],
            }],
        });

        return { success: true, status: 200, message: `Feedback fetched successfully`, data: report};
      } catch (error) {
         console.error(error.message);
         return new AppError(
            error.message
            , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
   
   async createFeedback ({ userId, body, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         
         const { description, issue  } = body;
         const report = await db[process.env.DEFAULT_DB].models.Feedback.create({
            description,
            issue,
            userId
        }, { transaction: t });

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Feedbacks fetched successfully`, data: report};
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message
            , error.line || __line, error.file || __path.basename(__filename), { name: error.name, status: error.status ?? 500, show: error.show });
      }
   }
}
module.exports = FeedbackService;
