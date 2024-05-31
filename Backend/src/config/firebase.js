const admin = require("firebase-admin");
const fcm = require('fcm-notification')

const serviceAccount = require("./firebase-accounts/primaryoffer-b7a82-firebase-adminsdk-97c8u-a0f6c3567d.json");

const certPath = admin.credential.cert(serviceAccount);
var FCM = new fcm(certPath);

admin.initializeApp({
  credential: certPath
});

module.exports = {admin, FCM};