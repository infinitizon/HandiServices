'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NotificationLog extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        NotificationLog.belongsTo(models.User, {
                foreignKey: "userId",
            })
        }
    };
    NotificationLog.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: DataTypes.UUID,
        title: DataTypes.STRING(1000),
        body: DataTypes.STRING(1000),
        activityType: DataTypes.STRING(1000),
        activityId: DataTypes.STRING(1000),
        isRead: DataTypes.BOOLEAN,
        isSeen: DataTypes.BOOLEAN,
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        tableName: 'notification_logs',
        modelName: 'NotificationLog',
    });
    return NotificationLog;
};
