// const { sendEmail } = require("../../config/emailSendpulse");
const { sendEmail } = require('../../config/email')
const currencyFormatter = require('currency-formatter');
const moment = require('moment');

class EmailBuilder {
  constructor({ sender, recipient, subject, message, template = 'newDefault.html' }) {
    this.recipient = recipient;
    this.sender = sender;
    this.subject = subject;
    this.message = message;
    this.template = template;
  }

  setCustomerDetails(customer) {
    this.customer = customer
    return this
  }

  setEmailType({ type, meta, message = null }) {
    switch (type) {
      case 'sign_up': {
        const message = meta.message ?? `
          <p>Thank you for signing up on HandiServices</p>
          <br>
          <p>Please use the token below to complete registration.</p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${meta.token}</h3>
          </div>
          <br>
        `
        this.email_payload = {
          message,
        }
        break
      }
      case 'admin-create-user': {
        const message = meta.message ?? `
          <p>${meta.tenant.name} has just created you as a ${meta.role.name} on Primary Offer</p>
          <br>
          <p>Please login using using the following credentials:</p>
          <br>
          <div>
            Username: <b>${meta.user.email}</b>
            Password: <b>${meta.password}</b>
          </div>
          <br>
        `
        this.email_payload = {
          message,
        }
        break
      }
      case 'forgot_password': {
        const message = meta.message ?? `
          <p>
            We received a request to reset your HandiServices password.
          </p>
          <p>
            If this was you please use the one-time code below to reset your account's password.
          </p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${meta.otp}</h3>
          </div>
          <br>
          <p>
            If you didn’t request a new password, you can safely ignore this email.
          </p>
          <p>
            Please note that this one-time code lasts 10 minutes.
          </p>
          <p>
            <strong>Just a reminder:</strong> Never share your password with anyone.
          </p>
        `
        this.email_payload = {
          message,
        }
        break;
      }
      case 'login': {
        let now = moment().format('llll');
        const message = meta.message ?? `
          You successfully logged into your HandiServices account on <large><b>${now}</b></large>.
          <br>
          <br>
          If you did not initiate this session, please contact our Support Team on 0700 HandiServices (0700 46837 862452)  
          or send an email to ${process.env.SUPPORT_EMAIL} immediately.
          <br>
          <br>
          <i>
          <b>Please note:<b> Never share your password with anyone. Create passwords that are hard to guess and don’t include personal information in your password.</i>
          <br>
          Thank you for choosing HandiServices.
          <br>
          <br>
          <i><b>This is an automated message, please do not reply directly to the email</b></i>
        `
        this.email_payload = {
          message,
        }
        break;
      }
      case 'change-password': {
        const message = meta.message ?? `
          <p>
            We received a request to reset your HandiServices password.
          </p>
          <p>
            If this was you please use the one-time code below to reset your account's password.
          </p>
          <br>
          <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
            <h3>${meta.otp}</h3>
          </div>
          <br>
          <p>
            If you didn't request a new password, you can safely ignore this email.
          </p>
          <p>
            Please note that this one-time code lasts 10 minutes.
          </p>
          <p>
            <strong>Just a reminder:</strong> Never share your password with anyone. 
            Create passwords that are difficult to guess and don’t include personal information in your password. 
            For added security, include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts.
          </p>
          <p>
            This is an automated message, please do not reply directly to the email.
          </p>
        `
        this.email_payload = {
          message,
        }
        break
      }
      case 'resend_otp': {
        const otp = meta.otp;
        const message = meta.message ? `
        <p>${meta.message}</p> 
        <br>
        <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
          <h3>${otp}</h3>
        </div>
        ` : `
        <p>Please enter this code to verify your account</p>
        <br>
        <div style="text-align:center; background:#219392; width: 25%; padding:3px; color: white; margin-left: auto; margin-right: auto;">
          <h3>${otp}</h3>
        </div>
        `
        this.email_payload = {
          message,
        }
        break
      }
      case 'register-user': {
        const message = meta.message ?? `
        Please Login into Invest Naija app <a href="https://app.HandiServices.com">here</a> with this password ${meta.defaultPassword} and reset your password.`
        this.email_payload = {
          message,
        }
        break
      }
      case 'fund_confirmation': {
        let now = moment().format('ll');
        const message = meta.message ?? `
          Your IN Wallet has been credited successfully with the sum of N ${meta.amount}. Here’s your updated account balance:
          <br>
          <br>
          Account Name: ${meta.name}<br>
          Account Number: ${meta.id}<br>
          Product: ${meta.product}<br>
          Current Balance: ${meta.balance}<br>
          <br>
          <br>
          Thank you for choosing HandiServices.
        `
        this.email_payload = {
          message,
        }
        break
      }
      case 'wallet-withdrawal': {
        try {
          const { amount, currency } = meta
          const currencyConverter = currencyFormatter.format(Number(amount), {
            locale: `en-${currency}`,
          });
          const message = meta.message ?? `Your wallet withdrawal of ${currencyConverter} was successful.<br>Amount deposited into your bank account`;
          this.email_payload = {
            message,
          }
          break
        } catch (error) {
          console.error(error);
        }
      }
      case 'withdrawal': {
        try {
          const { product, amount, currency, fundApp, fund_name } = meta
          const currencyConverter = currencyFormatter.format(Number(amount), {
            locale: `en-${currency}`,
          });
          let email_product;
          if (!fundApp) {
            email_product = product.toLowerCase() === 'planin' ? 'PlanIN' : 'SaveIN';
          } else {
            email_product = fund_name
          }

          const message = meta.message ?? `
            You just successfully redeemed ${currencyConverter} from your ${email_product}.
            <br>
            <br>
            <i>If you have any questions, please call us on 0700 HandiServices (0700 46837 862452) or send an email to Info@HandiServices.com</i>
            <br>
            <br>
            Thank you for choosing HandiServices. 
          `
          this.email_payload = {
            message,
          }
          break
        } catch (error) {
          console.error(error);
        }
      }
      case 'tradein': {
        this.email_payload = {
          subject: 'Thank you for your order',
          template: 'tradeinReceipt.html',
          reference: this.meta.reference,
          purchase: this.meta.purchase,
          order_type: this.meta.order_type,
          units: this.meta.units,
          price: this.meta.price,
          status: 'Processing',
          total: this.meta.total,
          email: this.meta.email
        }
        break;
      }
      case 'login_failed': {
        let now = moment().format('llll');

        const message = meta.message ?? `Your login attempt on ${now} was unsuccessful.
        <br>
        If you did not initiate this session, please change your password immediately. 
        <br>
        <br>
        <strong>Just a reminder:</strong> Never share your password with anyone. Create passwords that are hard to guess and don't
        include personal information in your password.</i>
        <br>
        Thank you for choosing HandiServices.
        <br>
        `
        this.email_payload = {
          message,
        }
        break;
      }
      case 'change_password_success': {
        const message = meta.message ?? `
        <p>
        You have successfully changed the password for your HandiServices account.
        </p>
        <p>
        If you did not make this change, please change your password immediately.  
        </p>
        <p>
        <strong>Just a reminder:</strong> Never share your password with anyone. 
        Create passwords that are difficult to guess and don’t include personal information in your password. For added security, 
        include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts. 
        </p>
        `
        this.email_payload = {
          message,
        }
        break;
      }
      case 'first-login': {
        const message = meta.message ?? `
        <p>On behalf of my team, I welcome you to HandiServices. We are delighted to have you on board, and we look forward to guiding you on your journey to financial security.</p>
        <p>If there’s anything I’ve learned in my nearly two decades leading <a href="https://www.chapelhilldenham.com">Chapel Hill Denham</a>, it's the importance of financial education and market access to lasting prosperity. So, we’ve built HandiServices with this in mind and will show Nigerians how to plan, save, and invest responsibly.</p>
        <p>We have curated savings and investment products that allow you to reap the full benefits of compounding, so your money works harder for you, as you take your first step towards financial freedom today.</p>
        <p>Of note, we are excited about our 100M65&trade; investment product, which essentially enables you to make SMART financial decisions for tomorrow. No matter where you start, you are guaranteed to end with N100,000,000 by the time you turn 65, ensuring you have a sizeable retirement fund to depend on.</p>
        <p>You can rest assured that your funds are safe and are professionally managed by our experienced investment team.</p>
        <p>My colleague, [Adaora], will be in touch with you over the coming weeks and will serve as your guide to ensure you get the most out of your money with HandiServices.</p>
        <p>Keep Well.</p>
        <p><strong>Bolaji Balogun</strong></p>
        <p><strong>CEO</strong></p>
        <br>
        <i>PLEASE DO NOT REPLY TO THIS EMAIL</i>
        `
        this.email_payload = {
          message,
        }
        break;
      }
      case 'cscs-request': {
        const message = `
        <p>Your CSCS account creation has successfully been initiated.</p>
        <br>
        <p>Please be aware that this process may take between 24 to 48 hours to complete.</p>
        <br>
        <p>You will be notified once the process is complete.</p>
        `;
        this.email_payload = {
          message
        }
        break;
      }
      case 'reset-password': {
        const message = `
        <p>Your password was recently updated. If you did not make this change, please contact our 
        Support Team on 0700 HandiServices (0700 46837 862452) or send an email to ${process.env.SUPPORT_EMAIL} right away</p>.
        <br>
        <p>
            <strong>Just a reminder:</strong> Never share your password with anyone. 
            Create passwords that are difficult to guess and don’t include personal information in your password. 
            For added security, include uppercase and lowercase letters, numbers, and symbols. Lastly, try to use different passwords for each of your online accounts.
          </p>
         <br>
         `;
        this.email_payload = {
          message
        }
        break;
      }
      case 'zanibal-created': {
        const message = `Please Login into Invest Naija app <a href="https://app.HandiServices.com">here</a> with this password ${meta.defaultPassword} and reset your password.`;
        this.email_payload = {
          message
        }
        break;
      }
      case 'zanibal-creation-error': {
        const message = `Please the customer with bvn: ${meta.customer.bvn} was not registered due to an error, Kindly Fix.`;
        this.email_payload = {
          message
        }
        break;
      }
      case 'cscs-created': {
        const message = `
          <p>Your CSCS account number processing is complete.</p>
          <p>
            Comment: ${meta.comment}<br />
            CSCS.${meta.cscsNo}<br />
            CHN.${meta.chn}
          </p>
        `;
        this.email_payload = {
          message
        }
        break;
      }
      case 'tokenized-payment': {
        const message = `Your payment of ${meta.amount} for ${meta.description} is successful, your application is now confirmed.Your allotment is being processed and would be completed shortly.`;
        this.email_payload = {
          message
        }
        break;
      }
      case 'wallet-funding-webhook': {
        const message = `Your ${meta.description} of ${meta.amount} was successful.`;
        this.email_payload = {
          message
        }
        break;
      }
      case 'deposit-receipt': {
        const { amount, currency } = meta;
        const currencyConverter = currencyFormatter.format(Number(amount), {
          locale: `en-${currency}`,
        });
        const message = meta.message ?? `Your account has been successfully funded with ${currencyConverter}.
        <br>
        Please note that funds received are processed in 24 hours.
        <br>
        Thank you for choosing HandiServices.
        <br>
        <i>0700 HandiServices (0700 46837 862452)</i>
        <br>
        <i>Info@HandiServices.com</i>`
        this.email_payload = {
          message
        }
        break;
      }
      case 'okhi-init': {
        const { status } = meta;
        const message = `Your Location verification is ${status.toUpperCase()}.
        <br>
        Please note that, verification takes up to 5 days in extreme cases.
        <br>
        Thank you for choosing HandiServices.
        <br>
        <i>070046837862452 (0700HandiServices)</i>
        <br>
        <i>Info@HandiServices.com</i>`
        this.email_payload = {
          message
        }
        break;
      }
      case 'okhi-status': {
        const { status } = meta;
        const message = `Your Location verification is ${status.toUpperCase()}.
        <br>
        Thank you for choosing HandiServices.
        <br>
        <i>070046837862452 (0700HandiServices)</i>
        <br>
        <i>Info@HandiServices.com</i>`
        this.email_payload = {
          message
        }
        break;
      }
      case 'tenant-user-created': {
        const message = `
        <p>Welcome to Primary Offer under the ${meta.tenant.name} tenant! Your account has been created successfully, and here are your account details:</p>
        <br>
        <ul>
          <li>Email: ${meta.newUser.email}</li>
          <li>Password: ${meta.password}</li>
          <li>Role: ${meta.roleExists.name}</li>
        </ul>
        <br>
        <p>You can now use your credentials to log in to Primary Offer and access your account within the ${meta.tenant.name} tenant.</p>

        <p>If you have any questions or need assistance, please contact your tenant administrator at ${meta.tenant.email}.</p>

        <p>Thank you for being a part of Primary Offer!</p>`;
        this.email_payload = {
          message
        }
        break;
      }
      default: {
        this.email_payload = {
          message,
          name: meta.name
        }
        break;
      }
    }
    return this;
  }
  addAttachments(attachments){
    this.attachments = attachments
    return this;
  }
  execute() {
    const email_ = {
      email: this.recipient,
      name: this.customer?.firstName ?? this.customer?.name,
      subject: this.subject,
      template: this.template,
      attachments: this.attachments,
      ...this.email_payload,
    }
    sendEmail(email_)
  }
}

module.exports = EmailBuilder
