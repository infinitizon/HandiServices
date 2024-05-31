const AppError = require('../../config/apiError');
const { AuditLogsService } = require('../services');
const { faq } = require('../utils/helper');
const { paginateOptions } = require('../utils/pagination');
const FaqService = require('../services/faq.service')
const { successResponse } = require('../utils/responder');

class FaqsController {
   static getAllFAQs = async(req, res, next) => {
      /**
      * #swagger.description = 'Successfully gotten FAQs'
      * #swagger.responses[200] = {
         description: 'Successfully gotten FAQs',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  [
                     {     
                        $id: 1,
                        $question:"How do I subscribe",
                        $answer:"<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>" 
                     }
                  ]
         }
      }
         */
      try{
         const results = await faq()
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static getAll = async(req, res, next) => {
      /**
      * #swagger.description = 'Successfully gotten FAQs'
      * #swagger.responses[200] = {
         description: 'Successfully gotten FAQs',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {
                     $row: [
                        {     
                           $id: 1,
                           $question:"How do I subscribe",
                           $offer_id:"nalsnkn-ye83272-uiwnucn-7821348321",
                           $answer:"<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>" 
                        }
                     ],
                     $number_of_pages: 29
                  }
         }
      }
         */
      try{
         const {offer, search} = req.query
         const paginate = paginateOptions(req)
         const results = await FaqService.getAll({offer, paginateOptions: paginate, search})
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static createFaq = async(req, res, next) => {
      /**
       * 
      * #swagger.description = 'Successfully created FAQs'
      * * #swagger.parameters['obj'] = {
                    question: 'the quick brown fox jumps over the lazy dog,
                    answer: 'ebwK6AkFhktABmCwrDFRGg',
                    offer_id:"nalsnkn-ye83272-uiwnucn-7821348321"
                }
            }'
      * #swagger.responses[200] = {
         description: 'Successfully created FAQs',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {     
                     $id: 1,
                     $question:"How do I subscribe",
                     $offer_id:"nalsnkn-ye83272-uiwnucn-7821348321",
                     $answer:"<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>" 
                  }
         }
      }
         */
      try{
         const results = await FaqService.create(req.body)
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static getOne = async(req, res, next) => {
      /**
      * #swagger.description = 'Successfully gotten FAQ'
      * #swagger.responses[200] = {
         description: 'Successfully gotten FAQ',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {     
                     $id: 1,
                     $question:"How do I subscribe",
                     $offer_id:"nalsnkn-ye83272-uiwnucn-7821348321",
                     $answer:"<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>" 
                  }
         }
      }
         */
      try{
         const {id}= req.params
         const results = await FaqService.getOne({id})
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }

   static updateFaq = async(req, res, next) => {
      /**
       * * #swagger.description = 'For user login. Any user can login
         * #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Login a user to app',
                schema: {
                    $question: 'aa@bb.com',
                    $answer: 'ebwK6AkFhktABmCwrDFRGg=='
                }
            }'
      * #swagger.description = 'Successfully updated FAQ'
      * #swagger.responses[200] = {
         description: 'Successfully updated FAQ',
         schema: {
            $status: 200,
            $success: true,
            $message: 'Success',
            $data: 
                  {     
                     $id: 1,
                     $question:"How do I subscribe",
                     $offer_id:"nalsnkn-ye83272-uiwnucn-7821348321",
                     $answer:"<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>" 
                  }
         }
      }
         */
      try{
         const {id}= req.params
         const {question, answer} = req.body
         const results = await FaqService.update({id, question, answer})
         return successResponse(req, res, results)
      }catch(error){
         return next(
            new AppError(
                error.message
                , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        );
      }
   }
}
module.exports = FaqsController;
