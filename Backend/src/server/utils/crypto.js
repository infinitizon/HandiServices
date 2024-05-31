const CryptoJS = require("crypto-js");

module.exports = class Crypto {

   constructor({aesKey = '', ivKey = '', secret = ''}) {
      this.aesKey = aesKey;
      this.ivKey = ivKey;
      this.algorithm = "aes-256-cbc";
      this.secret = secret
   }

  encryptWithSecret(data) {
    const bytes  = CryptoJS.AES.encrypt(data, this.secret);

    return bytes.toString();
  }
  decryptWithSecret(data) {
    const bytes  = CryptoJS.AES.decrypt(data, this.secret);

    return bytes.toString(CryptoJS.enc.Utf8);
  }
  encryptWithKeyAndIV(dataToBeEncrypted) {
    if (typeof dataToBeEncrypted !== "string") {
      throw Error(`Cypher.encrypt: argument must be string; objects must must be stringified`);
    }
    let _key = CryptoJS.enc.Utf8.parse(this.aesKey);
    let _iv = CryptoJS.enc.Utf8.parse(this.ivKey);
    let encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(dataToBeEncrypted), _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
    console.log(encrypted.toString());

    return encrypted.toString();
  }

  decryptWithKeyAndIV(encryptedData) {
    if (typeof encryptedData !== "string") {
      throw Error(`Cypher.decrypt error: argument must be string`);
    }
    let _key = CryptoJS.enc.Utf8.parse(this.aesKey);
    let _iv = CryptoJS.enc.Utf8.parse(this.ivKey);

    const decrypted =  CryptoJS.AES.decrypt(
      encryptedData, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
