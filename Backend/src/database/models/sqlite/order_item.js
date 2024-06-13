'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class OrderItem extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         OrderItem.belongsTo(models.Order, {
            foreignKey: 'orderId',
         });
         OrderItem.belongsTo(models.ProductVendorCharacter, {
            foreignKey: 'prodVendorXter',
         });
      }
   };
   OrderItem.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      orderId: DataTypes.UUID,
      prodVendorXter: DataTypes.UUID,
      value: DataTypes.STRING,
      qty: DataTypes.FLOAT,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'order_items',
      modelName: 'OrderItem',
   });
   return OrderItem;
};


