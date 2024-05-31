const nodemailer = require('nodemailer')
const fs = require('fs')
require("dotenv").config();
const handlebars = require('handlebars');
const path = require('path')
const { MandrillTransport } = require('mandrill-nodemailer-transport');

handlebars.registerHelper('breaklines', (text) => {
    text = handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new handlebars.SafeString(text);
})

const mandrill = new MandrillTransport({
    apiKey: process.env.MANDRILL_KEY
});
let smtpTransport = nodemailer.createTransport(mandrill);


const sendEmail = async options => {
    const replacements = options;
    let url = new URL('/emailTemplates/', process.env.APP_BASE_URL).href;

    replacements.image = url + "assets/" + (Math.floor(Math.random() * 10) + 1) + ".jpg";
    replacements.url = url

    let loc = path.join(__dirname, '../../', 'public/emailTemplates/default.html');
    // let loc = __dirname + 'public/emailTemplates/default.html';
    loc = loc.replace("config", "");

    let html = fs.readFileSync(loc, "utf-8");
    let template = handlebars.compile(html);
    let htmlToSend = template(replacements);
    let mailOptions = {
        from: 'HandiServices <info@HandiServices.com>',
        to: options.email,
        subject: options.subject,
        replyTo: options.replyTo,
        html: htmlToSend,
        attachments: options.attachments
    };

    await smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log('Error Sending Email with Template: ', error);
            throw error;
        }
        console.log("Message sent: " + JSON.stringify(response));
    });
}
module.exports = { sendEmail };
