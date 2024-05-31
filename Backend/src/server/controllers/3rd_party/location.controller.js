const OkhiService = require('../../services/okhi.service');

const AppError = require('../../../config/apiError');

class LocationController {

    list_user_location = async (req, res, next) => {
        const { gateway } = req.params

        const response =  gateway === "okhi" ? await (new OkhiService).list_user_location(req.user) : null
        if (response?.code === 201){
           return res.status(response?.code).json(response);
        }
        return next(new AppError(response?.message, __line, __path.basename(__filename), 400));  
    }

    create_user = async (req, res, next) => {
        const { gateway } = req.params
        const response = gateway === "okhi" ? await (new OkhiService).create_user(req.body, req.user) : null
        if (response?.code === 201){
            return res.status(response?.code).json(response);
        }
        return next(new AppError(response?.message, __line, __path.basename(__filename), 400));  
    }

    callback_url = async (request, response) => {
        await (new OkhiService).callback_url(request.body.v2)
        return response.sendStatus(200);
    }

}

module.exports = LocationController