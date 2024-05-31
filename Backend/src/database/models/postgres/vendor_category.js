'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class TenantCategory extends Model {
      /**
      * Helper method for defining associations.
      * This method is not a part of DataTypes lifecycle.
      * The `models/index` file will call this method automatically.
      */
      static associate(models) {
      }
   };
   TenantCategory.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      tenantId: DataTypes.UUID,
      productId: DataTypes.UUID,
   }, {
      sequelize,
      underscored: true,
      modelName: 'TenantCategory',
      tableName: 'tenant_categories',
   });
   return TenantCategory;
};


