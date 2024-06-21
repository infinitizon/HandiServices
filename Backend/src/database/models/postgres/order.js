'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
   class Order extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         Order.belongsTo(models.User, {
            foreignKey: 'userId',
         });
         Order.belongsToMany(models.Address, {
            through: models.OrderAddress,
            foreignKey: 'orderId',
            as: 'Addresses'
         });
         Order.hasMany(models.OrderItem, {
            foreignKey: 'orderId',
         });
         Order.hasMany(models.ChatSession, {
            foreignKey: 'sessionId',
         });
         Order.hasMany(models.TxnHeader, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'order',
            },
         });
      }
   };
   Order.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      status: {
         type: DataTypes.SMALLINT,
         defaultValue: 100,
         get() {
             const rawValue = this.getDataValue('status');
             return  DBEnums.OrderStatus.find(g=>g.code===rawValue).label
         },
         set(value) {
            const result = DBEnums.OrderStatus.find(g=>g.code===value)
                ? value
                : DBEnums.OrderStatus.find(g=>g.label===value).code;
             this.setDataValue('status', result);
         }
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'orders',
      modelName: 'Order',
   });
   return Order;
};


