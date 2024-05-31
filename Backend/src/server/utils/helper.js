class Helper {
  
  static generateOTCode = (size = 6, alpha = true) => {
    let characters = alpha
      ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-"
      : "0123456789";
    characters = characters.split("");
    let selections = "";
    for (let i = 0; i < size; i++) {
      let index = Math.floor(Math.random() * characters.length);
      selections += characters[index];
      // characters.splice(index, 1);
    }
    return selections;
  };

  static generatePassword = (length, {includeNumbers=true, includeUpperChars=true, includeLowerChars=true, includeSpecialChars=true}) => {
        let numberChars = "0123456789";
        let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let lowerChars = "abcdefghiklmnopqrstuvwxyz";
        let specialChars = "`~!@#$%^&*()_-+=<>,.?|";
        let allChars = (includeNumbers?numberChars:'') + (includeUpperChars?upperChars:'') + (includeLowerChars?lowerChars:'') + (includeSpecialChars?specialChars:'');
        let randPasswordArray = Array(length);
        randPasswordArray[0] = numberChars;
        randPasswordArray[1] = upperChars;
        randPasswordArray[2] = lowerChars;
        randPasswordArray[3] = specialChars;
        randPasswordArray = randPasswordArray.fill(allChars, 3);
        return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] })).join('');

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
  }
  static capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
  }
  static getMimeType = (base64)=>{
    const signatures = {
      JVBERi0: 'application/pdf',
      R0lGODdh: 'image/gif',
      R0lGODlh: 'image/gif',
      iVBORw0KGgo: 'image/png',
      '/9j/': 'image/jpg',
    };
    for(const sign in signatures)if(base64.startsWith(sign)) return signatures[sign];
  };

  static checkToken = async ({time, tokenTime}) => {
    let now = new Date()
    now.setMinutes(now.getMinutes())
    now = new Date(now)
    const diff = now - tokenTime
    if(diff >= (Number(time)*60000)){
      return false
    }
    return true
  }

  static faq = async () => {
    const faqs = [
      {id: 1, question: 'How do I subscribe', answer: '<br>Follow the steps below to subscribe<ul><li>Select available investment product.</li><li>View details of the transaction.</li><li>Input units to subscribe,CSCS and Bank details</li><li>Read and accept the terms and conditions of the application and prospectus</li><li>Proceed to pay</li><li>You will receive a notification of the transaction in your email</li></ul>'},
      {id: 2,question: 'What is a CSCS No?', answer: 'The CSCS No. (Central Securities Clearing System) and CHN (Clearing House Number) are investors unique identifier to purchase and/or sell securities.'},
      {id: 3,question: 'I already have a CSCS number, what do I do?', answer: 'If you have a CSCS number, simply input your number in the relevant field and follow the steps for verification.'},
      {id: 4,question: 'I don’t have a CSCS, can I still apply?', answer: 'Yes, if you do not have a CSCS account, one will be created for you as part of the application process on the PrimaryOffer platform. You will be required to input necessary details for creation. You will get an email informing you that your CSCS will be created and made available to you as soon as possible, however you can proceed to pay for your shares.'},
      {id: 5,question: 'How do I pay?', answer: '<br>Select one of the options available on the payment page<ul><li>Pay with card</li><li>Direct debit from your account</li><li>Pay via Electronic transfer</li><li>Pay with QR Code</li><li>Pay with USSD Code</li><li>Pay at the bank</li><li>Confirm the amount to be paid</li><li>Click on the Continue button</li></ul>(Once you select an option to make payment, you will find a summary with the details of your Transaction)'},
      {id: 6,question: 'How will I know my transaction if my transaction is successful?', answer: 'If you subscribe through PrimaryOffer application, you will receive a confirmation via email advising that your application has been successfully submitted. You will also be notified via the same platform of a copy of the application form and payment evidence.'},
      {id: 7,question: 'What information should I keep after I submit the application?', answer: 'If you submit through PrimaryOffer, you will receive a confirmation via email advising that your application has been successfully submitted. You will also be notified via the same platform of a copy of the application form and payment evidence.'},
      {id: 8,question: 'Can I submit multiple applications in the same name?', answer: 'No. Multiple applications will be rejected. Only one application allowed per investor.'},
      {id: 9,question: 'Will there be any charges when purchasing the shares on PrimaryOffer?', answer: 'No, there are no charges for purchasing shares, however investors will be required to pay payment processing fees'},
      {id: 10,question: 'Can I change my password, how do I go about it?', answer: 'Kindly select the “forgot password” option on the landing page and follow the instructions for a password reset.'},
      {id: 11,question: 'I tried to subscribe to the MTN share offer but I don’t have a CSCS account number', answer: 'Kindly follow the prompt on the application to create a CSCS account and your account details would be forwarded within 24 working hours.'},
      {id: 12,question: 'The App keeps timing out', answer: 'The application automatically logs you out if idle for a period of time.'},
      {id: 13,question: 'I get an error to contact my Bank when I tried to make payment with my Card', answer: 'Kindly contact your Bank for card enablement or make use of other available payment options.'},
      {id: 14,question: 'I got a failed error response after funding but was debited', answer: 'Reversal of funds typically takes 24 working hours. However, you may need to contact your Bank for further assistance.'},
      {id: 15,question: 'I have been debited but my payment status shows pending', answer: 'Kindly forward your proof of payment to <b>info@primaryofferng.com</b> for further review.'},
      {id: 16,question: 'I am unable to change my password', answer: 'The password field is case and space sensitive, ensure you input your details correctly and if it persists, please log out and log in again.'},
      {id: 17,question: 'I am unable to relaunch the app after your recent update.', answer: 'Kindly update your device OS and try again'},
      {id: 18,question: 'I received an error response "Page could not be found" while making payment with the USSD option', answer: 'Kindly refresh page to confirm if payment was successful. However, you can subscribe via other payment options.'},
      {id: 19,question: 'How do I contact your customer care?', answer: '<div class="text-danger"><b>Telephone</b> - (0700 46837862452)<br><b>Email</b> – info@primaryofferng.com</div>'},
    ]
    return faqs
  }
}

module.exports = Helper;
