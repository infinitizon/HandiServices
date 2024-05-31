'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductVendorCharacter extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         ProductVendorCharacter.belongsTo(models.ProductCharacter, {
            foreignKey: 'prodXterId',
         });
         ProductVendorCharacter.belongsTo(models.Tenant, {
            foreignKey: 'vendorId',
         });
         ProductVendorCharacter.belongsTo(models.Product, {
            foreignKey: 'subCategoryId',
         });
         ProductVendorCharacter.hasMany(models.OrderItem, {
            foreignKey: 'prodVendorXter',
         });
      }
   }
   ProductVendorCharacter.init(
      {
         id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
         },
         subCategoryId: DataTypes.UUID,
         prodXterId: DataTypes.UUID,
         vendorId: DataTypes.UUID, //Vendor
         price: DataTypes.FLOAT,
      },
      {
         sequelize,
         paranoid: true,
         underscored: true,
         tableName: 'product_vendor_xters',
         modelName: 'ProductVendorCharacter',
      }
   );
   return ProductVendorCharacter;
};
