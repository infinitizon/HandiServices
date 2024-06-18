const db = require("../../database/models");
const {
  getPagination,
  getPagingData,
  paginateOptions,
} = require("../utils/pagination");

const AppError = require("../../config/apiError");
// const SAP = require("../services/SAP.service");
const NotificationService = require("../services/notification.service");
const { FCM, admin } = require("../../config/firebase");
const genericRepo = require("../../repository");

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};
class NotificationController {
  static logNotifications = async (req, res, next) => {
    try {
      let request = ["customerId", "title", "body", "activityType"];
      request.map((item) => {
        if (!req.body[item])
          throw new AppError(
            `${item} is required`,
            __line,
            __path.basename(__filename),
            { status: 400, show: true }
          );
      });
      let { customerId, title, body, activityType, activityId } = req.body;

      const tx = await NotificationService.logMessage(
        title,
        body,
        activityType,
        activityId,
        customerId
      );

      res.status(200).json({
        status: "success",
        data: tx,
      });
    } catch (error) {
      console.error({
        status: error.status ?? 500,
        message: `File: ${error.file || __path.basename(__filename)}, Line: ${
          error.line || __line
        } => ${error.message}`,
      });
      return next(
        new AppError(
          error.message,
          error.line || __line,
          error.file || __path.basename(__filename),
          { name: error.name, status: error.status ?? 500, show: error.show }
        ),
        req,
        res,
        next
      );
    }
  };

  static registerToken = async (req, res, next) => {
    try {
      let id = req.user.id;
      let { deviceToken } = req.body;
      if (!deviceToken)
        throw new AppError(
          "Device token required.",
          __line,
          __path.basename(__filename),
          { status: 400, show: true }
        );
      const user = await db[process.env.DEFAULT_DB].models.customer.findByPk(id);
      user.deviceToken = deviceToken;
      //register to Topic
      await NotificationService.subscribeToTopic({
        deviceToken,
        topic: process.env.NOTIFICATIONS_CHANNEL,
      });
      await user.save();
      let resp = {
        code: 200,
        status: "success",
        message: "Token Updated",
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.error({
        status: error.status ?? 500,
        message: `File: ${error.file || __path.basename(__filename)}, Line: ${
          error.line || __line
        } => ${error.message}`,
      });
      return next(error);
    }
  };

  static sendNotifications = async (req, res, next) => {
    let resp;
    try {
      const { title, body, activity_type, activity_id, customer_id } = req.body;
      const sending = await NotificationService.sendMessage(
        title,
        body,
        activity_type,
        activity_id,
        customer_id
      );
      if (sending.success) {
        resp = {
          code: 200,
          status: "success",
          message: "Notification sent",
        };
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
      } else {
        resp = {
          code: 400,
          status: "failed",
          message: "Notification not sent",
        };
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
      }
      return next();
    } catch (error) {
      console.error({
        status: error.status ?? 500,
        message: `File: ${error.file || __path.basename(__filename)}, Line: ${
          error.line || __line
        } => ${error.message}`,
      });
      return next(
        new AppError(
          error.message,
          error.line || __line,
          error.file || __path.basename(__filename),
          { name: error.name, status: error.status ?? 500, show: error.show }
        ),
        req,
        res,
        next
      );
    }
  };

  static sendTestMessage = async (req, res, next) => {
    try {
      const { title, body, activityType, activityId, deviceToken } = req.body;
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          activityType,
        },
      };
      const notify = await admin
        .messaging()
        .sendToDevice(deviceToken, message, notification_options)
        .then(async (response) => {
           return "success";
        })
        .catch((error) => {
          // return next(
          //     new AppError(
          //         error.message
          //         , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
          //         , req, res, next
          // );
          console.log(error);
        });
      let resp = {
        code: 200,
        status: "success",
        message: "Token Updated",
        data: notify,
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      // }
    } catch (error) {
      console.error({
        status: error.status ?? 500,
        message: `File: ${error.file || __path.basename(__filename)}, Line: ${
          error.line || __line
        } => ${error.message}`,
      });
      return next(
        new AppError(
          error.message,
          error.line || __line,
          error.file || __path.basename(__filename),
          { name: error.name, status: error.status ?? 500, show: error.show }
        ),
        req,
        res,
        next
      );
    }
  };

  static getAllUserNotifications = async (req, res, next) => {
    try {
      let id = req.user.id;
      let { page, size } = req.query;
      // const notifications =
      //   await db[process.env.DEFAULT_DB].models.notificationLog.findAndCountAll({
      //     limit: size,
      //     offset: page,
      //     where: { [db.Sequelize.Op.or]: [
      //       { customerId: id },
      //       { activityType: 'Admin preset notification' },
      //     ]},
      //     order: [["createdAt", "DESC"]],
      //   });

        const notifications = await genericRepo.setOptions('NotificationLog', {
          condition: { [db.Sequelize.Op.or]: [
            { customerId: id },
            { activityType: 'Admin preset notification' },
          ]},
          paginateOptions: { limit: size, offset: page }
        })
      let resp = {
        code: 200,
        status: "success",
        message: "Notifications fetched",
        data: notifications,
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.error({
        status: error.status ?? 500,
        message: `File: ${error.file || __path.basename(__filename)}, Line: ${
          error.line || __line
        } => ${error.message}`,
      });
      return next(
        new AppError(
          error.message,
          error.line || __line,
          error.file || __path.basename(__filename),
          { name: error.name, status: error.status ?? 500, show: error.show }
        ),
        req,
        res,
        next
      );
    }
  };

  static createPresetNotification = async (req, res, next) => {
    try {
      const create = await NotificationService.createNotification(req.body);
      let resp = {
        code: 200,
        status: "success",
        message: "Notifications created",
        data: create,
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static getPresetNotification = async (req, res, next) => {
    try {
      const find = await NotificationService.getOneNotification(req.query);
      let resp = {
        code: 200,
        status: "success",
        message: "Notification retrieved",
        data: find,
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static updatePresetNotification = async (req, res, next) => {
    try {
      const find = await NotificationService.updateNotifications(
        req.params.notificationId,
        req.body
      );
      let resp = {
        code: 200,
        status: "success",
        message: "Notification updated",
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static getAllPresetNotification = async (req, res, next) => {
    try {
      let paginator = paginateOptions(req);
      const all = await NotificationService.getAllNotifications(
        req.query,
        paginator
      );
      let resp = {
        code: 200,
        status: "success",
        message: "Notification gotten successfully",
        data: all,
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static deletePresetNotification = async (req, res, next) => {
    try {
      const del = await NotificationService.deleteNotifications(
        req.params.notificationId
      );
      let resp = {
        code: 200,
        status: "success",
        message: "Notification deleted successfully",
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static bulkSendNotification = async (req, res, next) => {
    try {
      const { title, body, activityType } = req.body;
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          activityType,
        },
      };
      const t = await NotificationService.sendNotificationToTopic({
        topic: process.env.NOTIFICATIONS_CHANNEL,
        payload: message,
      });
      let resp = {
        code: 200,
        status: "success",
        message: "Notification deleted successfully",
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      // next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };

  static subscribeToTopic = async (req, res, next) => {
    try {
      const create = await NotificationService.subscribeToTopic({
        ...req.body,
        topic: process.env.NOTIFICATIONS_CHANNEL,
      });
      let resp = {
        code: 200,
        status: "success",
        message: "Notifications created",
        data: {},
      };
      res.status(resp.code).json(resp);
      res.locals.resp = resp;
      return next();
    } catch (error) {
      console.log(error.message);
      return next(error);
    }
  };
}

module.exports = 
  NotificationController

