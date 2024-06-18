const HttpStatus = require('http-status');
const AppError = require("../../config/apiError");
const db = require("../../database/models");

// const { postgres, Sequelize } = require('../../database/models');
// const moment = require("moment");

class SecurityQuestionService {
    async getQuestions () {
       try {
          const questions = await db[process.env.DEFAULT_DB].models.SecurityQuestion.findAndCountAll();
          return {success: true, status: HttpStatus.OK, message: "Questions fetched successfully", total: questions.count, data: questions.rows,};
       } catch (error) {
          console.error(error.message);
          return new AppError(
                      error.message
                      , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
                );
       }
    }
    async getQuestion ({ id }) {
       try {
          const question = await db[process.env.DEFAULT_DB].models.SecurityQuestion.findByPk(id);
          return {success: true, status: HttpStatus.OK, data: question, message: "Question fetched successfully"};
       } catch (error) {
          console.error(error.message);
          return new AppError(
                      error.message
                      , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
                );
       }
    }
    async addQuestion ({ body, transaction }) {
       const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
       try {
          const question = await db[process.env.DEFAULT_DB].models.SecurityQuestion.create({
            ...body
          }, { transaction: t });
 
          transaction ? 0 : await t.commit();
          return {success: true, status: HttpStatus.CREATED, data: question, message: "Question created successfully"};
       } catch (error) {
          transaction ? 0 : await t.rollback();
          console.error(error.message);
          return new AppError(
                      error.message
                      , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
                );
       }
    }
    async updateQuestion ({ id, body, transaction }) {
        const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
        try {
            const { data: question, ...rest} = await this.getQuestion({id});
            if (!question || !rest.success) 
                throw new AppError(rest.message, rest.line||__line, rest.file||__path.basename(__filename), { status: rest.status||404, show: rest.show });
    
            await question.update({...body}, { transaction: t })
            transaction ? 0 : await t.commit();
            return {success: true, status: HttpStatus.CREATED, data: question, message: "Question updated successfully"};
        } catch (error) {
            transaction ? 0 : await t.rollback();
            console.error(error.message);
            return new AppError(
                        error.message
                        , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
                    );
        }
    }
}
module.exports = SecurityQuestionService;
