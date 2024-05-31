'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Product extends Model {
      static ProductType = {
          100: 'category', 
          101: 'sub_category',
          102: 'product',
          103: 'wallet',
      }
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
             return Product.ProductType[rawValue]
         },
         set(value) {
             const result = Object.keys(Product.ProductType).includes(value)
                 ? value
                 : getKeyByValue(Product.ProductType, value);
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


