const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const logSchema = new mongoose.Schema({

    ip: String,

    requestBody: String,

    responseBody: String,

    responseMessage: String,

    responseCode: String,

    endpoint: String,

    firstName: String,

    email: String,

    action: String,

    adminId: String

}, {
    timestamps: true
});

logSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('auditTrait', logSchema);
