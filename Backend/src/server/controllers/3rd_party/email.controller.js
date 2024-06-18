const db= require('../../../database/models');
const AppError = require('../../../config/apiError');

const EmailService = require('../../services/email-builder.service');

class EmailController {
    static send = async(req, res, next) => {
        let {recipients, sender, subject, name, message, customer_id} = req.body;
        const customer = await db[process.env.DEFAULT_DB].models.customer.findOne({
            where: { id: customer_id??null }
        });
        new EmailService({sender, recipient: recipients, subject, message})
            .setCustomerDetails(customer)
            .setEmailType( {type: "", meta: {name: name ?? customer?.firstName ??  this.customer?.name}, message})
            .execute();

        let resp = {
            code: 200,
            success: true,
            // data: {
                // account_balance: account_balance.data.balance
            // },
            };
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
    }
}
module.exports = EmailController
