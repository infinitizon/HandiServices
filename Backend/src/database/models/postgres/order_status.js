'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class OrderStatus extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         OrderStatus.belongsTo(models.OrderItem, {
            foreignKey: 'orderItemId',
         });
         OrderStatus.belongsTo(models.User, {
            foreignKey: 'movedBy',
         });
      }
   };
   OrderStatus.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      orderItemId: DataTypes.UUID,
      movedBy: DataTypes.UUID,
      status: DataTypes.STRING,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'order_items',
      modelName: 'OrderStatus',
   });
   return OrderStatus;
};


