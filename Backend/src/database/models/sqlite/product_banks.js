'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductBank extends Model {
      getCommon(options) {
         if (!this.commonType) return Promise.resolve(null);
         const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
         return this[mixinMethodName](options);
      }
      static associate(models) {
         ProductBank.belongsTo(models.Product, {
            foreignKey: 'commonId',
            constraints: false,
         });
         ProductBank.hasMany(models.ProductBankGateway, {
            foreignKey: 'productBankId',
            onDelete: 'cascade',
         });
      }
   }
   ProductBank.init(
      {
         id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
         },
         commonType: DataTypes.STRING,
         commonId: DataTypes.UUID,
         bankName: DataTypes.STRING,
         nameOnAccount: DataTypes.STRING(500),
         accountNumber: DataTypes.STRING(20),
         bankCode: DataTypes.STRING(10),
         businessName: DataTypes.STRING,
         email: DataTypes.STRING,
      },
      {
         sequelize,
         paranoid: true,
         underscored: true,
         tableName: 'product_banks',
         modelName: 'ProductBank',
      }
   );
   //Added to prevent duplicate issues during eager loading.
   ProductBank.addHook('afterFind', (findResult) => {
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'product' && instance.product !== undefined) {
            instance.common = instance.product;
         } else if (instance.commonType === "asset" && instance.asset !== undefined) {
            instance.common = instance.asset;
         }
         // delete to prevent duplicates
         delete instance.product;
         delete instance.dataValues.product;
         delete instance.asset;
         delete instance.dataValues.asset;
      }
   });
   return ProductBank;
};
