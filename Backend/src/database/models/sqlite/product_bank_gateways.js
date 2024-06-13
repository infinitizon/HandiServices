'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ProductBankGateway extends Model {

      static associate(models) {
         ProductBankGateway.belongsTo(models.ProductBank, {
            foreignKey: 'productBankId',
         });
      }
   };
   ProductBankGateway.init({
      id: {
         type: DataTypes.UUID,
         allowNull: false,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      productBankId: DataTypes.UUID,
      gateway: DataTypes.STRING,
      businessSecret: DataTypes.STRING(500),
      subAccountId: DataTypes.STRING,
      metaId: DataTypes.STRING,
      details: DataTypes.TEXT,
      type: DataTypes.STRING(50),
      name: DataTypes.STRING(50),
      logo: DataTypes.STRING(500)
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'product_bank_gateways',
      modelName: 'ProductBankGateway',
   });
   return ProductBankGateway;
};

    // saveplan_asset_bank