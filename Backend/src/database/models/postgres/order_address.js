'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class OrderAddress extends Model {
      /**
      * Helper method for defining associations.
      * This method is not a part of DataTypes lifecycle.
      * The `models/index` file will call this method automatically.
      */
      static associate(models) {
      }
   };
   OrderAddress.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      orderId: DataTypes.UUID,
      addressId: DataTypes.UUID,
   }, {
      sequelize,
      underscored: true,
      modelName: 'OrderAddress',
      tableName: 'order_addresses',
   });
   return OrderAddress;
};


