const { postgres, Sequelize } = require('../../database/models');
const {admin, FCM} = require('../../config/firebase');
const genericRepo = require('../../repository');

const notification_options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };
class NotificationService {
    static logMessage = async (
        title,
        body,
        activityType,
        activityId,
        customerId
      ) => {
      try {
        await genericRepo.setOptions('NotificationLog', {
          data: {
            title,
            body,
            activityType,
            activityId,
            customerId,
          }
        }).create()
      } catch (error) {}
    };

    static subscribeToTopic = async({deviceToken, topic}) => {
      const test = FCM.subscribeToTopic([deviceToken], topic, (err, resp) => {
        if(err){
          console.log('Yayyyyyy!!',JSON.stringify(err.errors))
          return
        }else{
          console.log('Sent successfully')
        }
      })
      //  const test = await admin.messaging().subscribeToTopic(deviceToken, topic)
       return test
    }

    static sendNotificationToTopic = async({payload, topic}) => {
      return admin.messaging().sendToTopic(topic, payload, notification_options)
    }

    static sendMessage = async (title, body, activityType, activityId, userId) => {
        try {
          const message = {
            notification: {
              title,
              body,
            },
            data: {
              activityType,
            },
          };
          const user = await genericRepo.setOptions('User', {
            selectOptions: ['deviceToken'],
            condition: {
              id: userId
            }
          }).findOne()
          // const user = await postgres.models.customer.findByPk(userId, {
          //   attributes: ['deviceToken']
          // });
          // find number of people with the same deviceToken
          // const userCount = await postgres.models.customer.findAll({
          //   attributes: ['deviceToken'],
          //   where: {deviceToken: user.deviceToken}
          // })

          const userCount = await genericRepo.setOptions('User', {
            selectOptions: ['deviceToken'],
            condition: {
              deviceToken: user.deviceToken
            }
          }).findAll()

          await this.logMessage(title, body, activityType, activityId, userId);
      
          if (!user.deviceToken || userCount.length > 1) {
            console.log('no push notification device available');
            return {success: true};
          } else {
            const notify = await admin
              .messaging()
              .sendToDevice(user.deviceToken, message, notification_options)
              .then(async (response) => {
                return 'success';
              })
              .catch((error) => {
                console.log(error);
              });
              if(notify === 'success'){
                return {success: true}
              }
          }
        } catch (error) {
          return new AppError(error.message, error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show});
        }
    };

    static createNotification = async({title, body, activityType}) => {
      const send = await this.sendNotificationToTopic({
        payload:{
          notification: {
            title,
            body,
          },
          data: {
            activityType,
          }
        }, 
        topic:process.env.NOTIFICATIONS_CHANNEL})
      // const create = await notificationRepo.create({title, body, activityType})
      const create = await genericRepo.setOptions('NotificationLog', {
        data: {title, body, activityType}
      }).create()
      return create
    }

    static getOneNotification = async(query) => {
      const { notificationId: id} = query
      let conditions = {customerId: null};
      if(id) conditions.id = id
      // if(activityType) conditions.activityType = activityType
      const getNotification = await genericRepo.setOptions('NotificationLog', {
        condition: conditions
      }).findOne()
      // const getNotification = await notificationRepo.find(conditions)
      return getNotification
    }

    static getAllNotifications = async(query, paginateOptions) => {
      const { notificationId: id, activityType, search } = query
      let conditions = {customerId: null};
      if(search){
        conditions = {
          [Sequelize.Op.or]:{
            activityType: {[Sequelize.Op.iLike]: `%${search}%`},
            title: {[Sequelize.Op.iLike]: `%${search}%`},
            body:{[Sequelize.Op.iLike]: `%${search}%`},
          }
        }
      }
      if(id) conditions.id = id
      if(activityType) conditions.activityType = activityType
      const getNotification = await genericRepo.setOptions('NotificationLog', {
        condition: conditions,
        paginateOptions
      }).findAllWithPagination()
      // const getNotification = await notificationRepo.findAndCountAll(conditions, paginateOptions)
      return getNotification
    }

    static deleteNotifications = async(id) => {
      // const getNotification = await notificationRepo.deleteResource(conditions, paginateOptions)
      const getNotification = await genericRepo.setOptions('NotificationLog', {
        condition: {id}
      })._delete()
      return getNotification
    }

    static updateNotifications = async(id, changes) => {
      // const update = await notificationRepo.update({id}, changes)
      const update = await genericRepo.setOptions('NotificationLog', {
        condition: {id},
        changes
      }).update()
      return update
    }

}

module.exports = 
    NotificationService
