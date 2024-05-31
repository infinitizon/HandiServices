const AppError = require('../../config/apiError')
// const Socket = require("../utils/socket.io");
const { ChatService } = require('../services');


class ChatController {

    /* #swagger.tags = ['Chats'] */
    static async getTenantSessions(req, res, next) {
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
            const auth = res.locals.user;
            const chatService = new ChatService;
            const chats = await chatService.getTenantSessions({ tenantId: auth.tenantId })
            if (!chats || !chats.success)
            throw new AppError(chats.show?chats.message:`Error fetching feedbacks`, chats.line||__line, chats.file||__path.basename(__filename), { status: chats.status||404, show: chats.show });
            
            // const soc = (new Socket).getIo();
            // soc.to(req.user.email).emit("welcome","Event sent from inside of the route");
          
            res.status(200).json(chats);
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
    /* #swagger.tags = ['Chats'] */
    static async claimSession(req, res, next) {
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
            const auth = res.locals.user;
            const chatService = new ChatService;
            const claim = await chatService.claimSession({ auth, session: req.body.session })
            if (!claim || !claim.success)
            throw new AppError(claim.show?claim.message:`Error fetching feedbacks`, claim.line||__line, claim.file||__path.basename(__filename), { status: claim.status||404, show: claim.show });

            res.status(200).json(claim);
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
    /* #swagger.tags = ['Chats'] */
    static async saveMessage(req, res, next) {
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
            const chatService = new ChatService;
            const body = req.body;
            const msg = await chatService.createChat({ ...body })
            if (!msg || !msg.success)
            throw new AppError(msg.show?msg.message:`Error fetching feedbacks`, msg.line||__line, msg.file||__path.basename(__filename), { status: msg.status||404, show: msg.show });

            res.status(200).json(msg);
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
    /* #swagger.tags = ['Chats'] */
    static async chatHistory(req, res, next) {
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
            const chatService = new ChatService;
            const body = req.body;
            const msg = await chatService.chatHistory( body )
            if (!msg || !msg.success)
            throw new AppError(msg.show?msg.message:`Error fetching feedbacks`, msg.line||__line, msg.file||__path.basename(__filename), { status: msg.status||404, show: msg.show });

            res.status(200).json(msg);
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

module.exports = ChatController;
