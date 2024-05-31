const nodemailer = require('nodemailer');
const fs = require('fs');
// const path = require('path');
const handlebars = require('handlebars');
// const mandrillTransport = require('nodemailer-mandrill-transport');
const { MandrillTransport } = require('mandrill-nodemailer-transport');

handlebars.registerHelper('breaklines', (text) => {
  text = handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new handlebars.SafeString(text);
});

const mandrill = new MandrillTransport({
  apiKey: process.env.MANDRILL_KEY
});
// 996479070459
// 9f217610bbedba16737a7b48797fcbfd19fa7d257e5e8dd4ec

// const gmailTransport = {
//   service: 'gmail',
//   auth: {
//     user: 'infinitizon@gmail.com',
//     pass: 'Dickele@1-'
//   }
// }
// 1) Create a transporter
let smtpTransport = nodemailer.createTransport(mandrill);
// let smtpTransport = nodemailer.createTransport(gmailTransport);

// 2) Send mail
const sendEmail = async  (options) => {
  const replacements = options;
  let url = new URL('/emailTemplates/', process.env.BACKEND_BASE).href;

  replacements.image =
    url +
    'assets/' +
    (options.images
      ? options.images[Math.floor(Math.random() * options.images.length)]
      : Math.floor(Math.random() * 10) + 1 + '.jpg');
  replacements.url = url;

  let templatePath =
    __path.join(__dirname, '../../', `/public/emailTemplates/${options.template ? options.template : 'default.html'}`);

  templatePath = templatePath.replace('config', '');

  let html = fs.readFileSync(templatePath, 'utf-8');
  let template = handlebars.compile(html);
  let htmlToSend = template(replacements);
  let mailOptions = {
    from: 'HandiServices <info@investnaija.com>',
    // from: 'infinitizon@gmail.com',
    to: options.email,
    subject: options.subject,
    replyTo: options.replyTo,
    html: htmlToSend,
    attachments: options.attachments,
  };
  await smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) { 
      console.log(`Error Sending Email with Template: ${options.template ? options.template : 'default.html'}`, error);
      // throw error;
      return;
    }
    console.log('Message sent: ' + JSON.stringify(response));
  });
};

module.exports = { sendEmail };
