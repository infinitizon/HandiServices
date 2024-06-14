'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
   class Product extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         Product.hasMany(models.Media, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'product',
            },
         });
         Product.hasMany(models.TxnHeader, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'product',
            },
         });
         Product.hasMany(models.ProductVendorCharacter, {
            foreignKey: 'subCategoryId',
         });
         Product.belongsToMany(models.Tenant, {
            through: models.TenantCategory,
            foreignKey: 'productId',
         });
         Product.hasMany(models.ProductBank, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               common_type: 'product',
               commonType: 'product',
            },
         });
      }
   };
   Product.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      pId: DataTypes.UUID,
      type: {
         type: DataTypes.SMALLINT,
         defaultValue: 100,
         get() {
             const rawValue = this.getDataValue('type');
             return  DBEnums.ProductType.find(g=>g.code===rawValue).label
         },
         set(value) {
            const result = DBEnums.ProductType.find(g=>g.code===value)
                ? value
                : DBEnums.ProductType.find(g=>g.label===value).code;
             this.setDataValue('type', result);
         }
      },
      title: DataTypes.STRING,
      metaTitle: {
         type: DataTypes.STRING,
         field: 'meta_title',
      },
      sku: DataTypes.STRING,
      summary: DataTypes.STRING(1000),
      description: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      ownedBy: DataTypes.UUID,  //Id of the creator of the product
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'products',
      modelName: 'Product',
   });
   return Product;
};


