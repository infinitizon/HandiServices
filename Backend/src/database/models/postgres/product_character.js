'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductCharacter extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         ProductCharacter.belongsTo(models.Product, {
            foreignKey: 'productId',
         });
         ProductCharacter.hasMany(models.ProductVendorCharacter, {
            foreignKey: 'prodXterId',
         });
      }
   }
   ProductCharacter.init(
      {
         id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
         },
         productId: DataTypes.UUID,
         name: {
            type: DataTypes.STRING(100),
            allowNull: false,
         },
         type: DataTypes.STRING(100),  // I'm thinking of types like inc_dcr, range, string, number, mcma, mcsa
         misc: DataTypes.TEXT,         // This is only useful when options like mcma, mcsa or range
         minPrice: DataTypes.FLOAT,
         maxPrice: DataTypes.FLOAT,
      },
      {
         sequelize,
         paranoid: true,
         underscored: true,
         tableName: 'product_xters',
         modelName: 'ProductCharacter',
      }
   );
   return ProductCharacter;
};
