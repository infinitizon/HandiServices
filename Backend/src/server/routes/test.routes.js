const express = require('express');
// const { v4: uuidv4 } = require('uuid');
const { postgres, } = require('../../database/models');
// const AuthController = require('../controllers/auth.controller');
const TestController = require('../controllers/test.controller');
// const NotificationController = require('../controllers/notification.controller');

const router = express.Router();

router.post('/cloud-upload', TestController.cloudUpload);
router.delete('/cloud-delete', TestController.cloudDelete);
router.get('/cloud-file', TestController.cloudGetFile);
// router.get('/db-backup', TestController.backup);
// router.post('/bvnupdate', TestController.migratebvn);
// router.get('/create-role', TestController.create)
// router.get('/create-tenants', TestController.tenantSeed)
// router.post('/notification/send', NotificationController.bulkSendNotification)
// router.get('/authenticate-authorize', AuthController.authenticate, AuthController.authorize(['PROVIDER_ADMIN']));
router.post('/many-many', async (req, res, ) => {
   // const Tenant = await postgres.models.tenant.findAll();
   // res.status(200).json({
   //   Tenant
   // });
   // const Tenant = await postgres.models.tenant.create({
   //    id: uuidv4(),
   //    name: "CHDS",
   //    enable: true
   // });
   // const User1 = await postgres.models.user.create({
   //    id: uuidv4(),
   //    email: "aa@bb.com",
   //    password: '1234',
   //    enable: true,
   // });
   // const User2 = await postgres.models.user.create({
   //    id: uuidv4(),
   //    email: "ab@bb.com",
   //    password: '1234',
   //    enable: true,
   // });
   // await Tenant.addUser(User1, { through: { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342' } });
   // await Tenant.addUser(User1, { through: { role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc' } });
   // await Tenant.addUser(User2, { through: { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342' } });
   // await Tenant.addUser(User1, { through: { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342' } });

   const Tenant = await postgres.models.tenant.findOne({
      include: [
         {
            model: postgres.models.tenant_user_roles, 
            include: [
               {model: postgres.models.user, attributes: ["id", "email"], }
            ]
         }
      ],
      where: {id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d',}
   })
   res.send(Tenant)
});
module.exports = router;
