const AppError = require('../../config/apiError')
const { FeedbackService } = require('../services')


class ReportController {

    /* #swagger.tags = ['Reports'] */

    static async getAllReport(req, res, next) {
        /* #swagger.description = 'Get all Reports with optional filters.' */
        /* #swagger.parameters['user_id'] = {
            in: 'query',
            description: 'Filter by user_id',
            required: false,
            type: 'string',
            format: 'date'
        } */
        /* #swagger.parameters['reason'] = {
            in: 'query',
            description: 'Filter by customer reports reason (partial match).',
            required: false,
            type: 'string'
        } */
        /* #swagger.parameters['issue'] = {
            in: 'query',
            description: 'Filter by customer reports issue (partial match).',
            required: false,
            type: 'string'
        } */
        /* #swagger.parameters['description'] = {
            in: 'query',
            description: 'Filter by customer reports description (partial match).',
            required: false,
            type: 'string'
        } */
        /* #swagger.responses[200] = {
            description: 'A list of reports.',
            schema: { type: 'array', items: { $ref: '#/components/schemas/Report' } }
        } */
        /* #swagger.responses[500] = {
            description: 'Internal server error.'
        } */
        try {
            const feedbackService = new FeedbackService
            const feedbacks = await feedbackService.getAllFeedback({ query: req.query})
            if (!feedbacks || !feedbacks.success)
            throw new AppError(feedbacks.show?feedbacks.message:`Error fetching feedbacks`, feedbacks.line||__line, feedbacks.file||__path.basename(__filename), { status: feedbacks.status||404, show: feedbacks.show });

            res.status(200).json(feedbacks);
        } catch (error) {
            console.log(error.message);
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
    
    static async createReport(req, res, next) {
        /* #swagger.description = 'Create a new report.' */
        /* #swagger.parameters['Report'] = {
            in: 'body',
            description: 'Create a new report with provided details.',
            required: true,
            type: 'object',
            schema: { $ref: '#/components/schemas/createReport' }
        } */
        /* #swagger.responses[201] = {
            description: 'The created report.',
            schema: { $ref: '#/components/schemas/Report' }
        } */
        /* #swagger.responses[500] = {
            description: 'Internal server error.'
        } */
        try {
            let { userId } = res.locals.user;

            const feedbackService = new FeedbackService
            const feedback = await feedbackService.createFeedback({ userId, body: req.query})
            if (!feedback || !feedback.success)
            throw new AppError(feedback.show?feedback.message:`Error creating feedback`, feedback.line||__line, feedback.file||__path.basename(__filename), { status: feedback.status||404, show: feedback.show });

            res.status(201).json(feedback);
        } catch (error) {
            console.log(error.message);
            return next(
                new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
            );
        }
    }

    static async getReport(req, res, next) {
        /* #swagger.description = 'Get a specific report by ID.' */
        /* #swagger.parameters['report_id'] = {
            in: 'path',
            description: 'The ID of the report to retrieve.',
            required: true,
            type: 'string'
        } */
        /* #swagger.responses[200] = {
            description: 'The requested report.',
            schema: { $ref: '#/components/schemas/Report' }
        } */
        /* #swagger.responses[404] = {
            description: 'Report not found.'
        } */
        /* #swagger.responses[500] = {
            description: 'Internal server error.'
        } */
        try {
            const feedbackService = new FeedbackService
            const feedback = await feedbackService.getFeedback({ id: req.params.reportId})
            if (!feedback || !feedback.success)
            throw new AppError(feedback.show?feedback.message:`Error fetching feedback`, feedback.line||__line, feedback.file||__path.basename(__filename), { status: feedback.status||404, show: feedback.show });

            res.status(200).json(feedback);
        } catch (error) {
            console.log(error.message);
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
    
}

module.exports = ReportController;
