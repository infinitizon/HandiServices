'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
   class OrderItemStatus extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         OrderItemStatus.belongsTo(models.OrderItem, {
            foreignKey: 'orderItemId',
         });
         OrderItemStatus.belongsTo(models.User, {
            foreignKey: 'movedBy',
         });
      }
   };
   OrderItemStatus.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      orderItemId: DataTypes.UUID,
      movedBy: DataTypes.UUID,
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
      tableName: 'order_item_status',
      modelName: 'OrderItemStatus',
   });
   return OrderItemStatus;
};


