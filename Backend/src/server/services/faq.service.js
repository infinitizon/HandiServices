const moment = require("moment");
const xlsx = require("xlsx");
const { postgres, Sequelize } = require("../../database/models");
const genericRepo = require("../../repository");
const { abortIf } = require("../utils/responder");
const httpStatus = require("http-status");
const AppError = require("../../config/apiError");

class FaqService {
  static async getAll({search, paginateOptions, offer}) {
    let condition = {}
    if(offer){
      condition = {
        offer_id: offer
      }
    }
    if(search){
      condition = {
        ...condition,
        [Op.or]: [
          {question:{ [Sequelize.Op.iLike]: `%${search}%`}},
          {answer:{ [Sequelize.Op.iLike]: `%${search}%`}}
        ]

      }
    }
    const faqs = await genericRepo.setOptions('Faq', {
      condition,
      paginateOptions
    }).findAllWithPagination()
    return faqs
  }

  static async create({question, answer, offer_id}) {
    const faq = await genericRepo.setOptions('Faq', {
      data: {
        question, answer, offer_id
      }
    }).create()
    return faq;
  }

  static async update({id, question, answer}) {
    let changes = {}
    if(question){
      changes = {
        ...changes,
        question
      }
    }
    if(answer){
      changes = {
        ...changes,
        answer
      }
    }
    const update = await genericRepo.setOptions('Faq', {
      changes,
      condition: {id},
      returning: true
    }).update()
    return update
  }
  static async getOne({id}) {
    const faq = await genericRepo.setOptions('Faq', {
      condition: {id}
    }).findOne()
    return faq;
  }
  static async deleteOne({id}) {

  }
}

module.exports = FaqService;