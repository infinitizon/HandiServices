const Log = require('./log');
const { postgres } = require('../database/models');

// const Admin = db.admins;

exports.logRequest = async (req, res, next) => {
    try {
        if (req.method !== 'GET') {
            if (req.originalUrl === "/") return next()
            let data = {};
            data.ip = req.ip;

            if (req.body) data.requestBody = JSON.stringify(req.body);
            data.endpoint = `${req.protocol}://${req.get('host')}${req.originalUrl}`
            data.createtype = 'request';
            req.log = await Log.create(data);
        }
        return next();
    } catch (error) {
        next(error);
    }
}

exports.logActivity = (action) => async (req, res, next) => {
    try {
        if (req?.user) {
            let admin = await postgres.models.admin.findByPk(req?.user?.id)
            if (admin) {
                const {email, firstName, id} = admin;
                if (req.log) {
                    const log = await Log.findById(req?.log?.id);
                    if (log) {
                        let data = {email, firstName, adminId: id, action};
                        await log.updateOne(data);
                    }
                }
            }
        }
        return next();
    } catch (error) {
        next(error);
    }
}

exports.logResponse = async (req, res, next) => {
    try {
        let resp = res.locals.resp;
        if (!resp) return next();
        // if (res?.locals?.resp) {
            if (req?.log) {
                const log = await Log.findById(req?.log?.id);
                if (log) {
                    let data = {};
                    if (resp.code) data.responseCode = resp.code;
                    if (resp.data) data.responseBody = JSON.stringify(resp.data);
                    if (resp.message) data.responseMessage = resp.message;
                    if (resp.errorCode) data.errorCode = resp.errorCode;
                    if (resp.errorMessage) data.errorMessage = resp.errorMessage;
                    await log.updateOne(data);
                }
            }
        // }
        // return next()
    } catch (error) {
        next(error);
    }
}
