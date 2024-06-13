'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Order extends Model {
      static OrderStatus = {
          100: 'pending', 
          101: 'failed',
          102: 'cancelled',
          103: 'placed',
          104: 'inprogress',
          105: 'done',
          106: 'completed',
      }
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         Order.belongsTo(models.User, {
            foreignKey: 'userId',
         });
         Order.belongsTo(models.Tenant, {
            foreignKey: 'tenantId',
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
      tenantId: DataTypes.UUID,
      status: {
         type: DataTypes.SMALLINT,
         defaultValue: 100,
         get() {
             const rawValue = this.getDataValue('status');
             return Order.OrderStatus[rawValue]
         },
         set(value) {
             const result = Object.keys(Order.OrderStatus).includes(value)
                 ? value
                 : getKeyByValue(Order.OrderStatus, value);
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


