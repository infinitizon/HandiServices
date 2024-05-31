'use strict';
const { Model } = require('sequelize');
const CloudObjUploadService  = require('../../../server/services/cloud-obj-upload.service');
module.exports = (sequelize, DataTypes) => {
   class Media extends Model {
      getCommon(options) {
         if (!this.commonType) return Promise.resolve(null);
         const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
         return this[mixinMethodName](options);
      }
      static associate(models) {
         Media.belongsTo(models.Tenant, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Media.belongsTo(models.Product, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Media.belongsTo(models.User, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Media.belongsTo(models.TxnHeader, {
            foreignKey: 'commonId',
            constraints: false,
         });
      }
   }
   Media.init(
      {
         id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
         },
         commonId: {
            type: DataTypes.UUID,
            allowNull: false
         },
         commonType: {
            type: DataTypes.STRING,
            allowNull: false
         },
         objectType: DataTypes.STRING,
         name: {
            type: DataTypes.STRING,
            allowNull: false
         },
         type: {
            type: DataTypes.STRING,
            allowNull: false
         },
         size: {
            type: DataTypes.STRING,
            allowNull: false
         },
         response: {
            type: DataTypes.TEXT,
            set(value) {
               this.setDataValue('response', JSON.stringify(value));
            },
            get() {
               return JSON.parse(this.getDataValue('response'));
            },
         },
      },
      {
         sequelize,
         paranoid: true,
         underscored: true,
         tableName: 'media',
         modelName: 'Media',
      }
   );
   //Added to prevent duplicate issues during eager loading.
   Media.addHook('afterFind', async (findResult) => {
      
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'user' && instance.user !== undefined) {
            instance.common = instance.user;
         } else if (instance.commonType === "tenant" && instance.tenant !== undefined) {
            instance.common = instance.tenant;
         } else if (instance.commonType === "product" && instance.product !== undefined) {
            instance.common = instance.product;
         }else if (instance.commonType === "txn_headers" && instance.txn_headers !== undefined) {
            instance.common = instance.txn_headers;
         }
         
         if(instance?.response) {
            const img = JSON.parse(instance?.response);
            const uploaderService = new CloudObjUploadService({service: img.service});
            const uploaded = await uploaderService.getFile(img);
            instance.setDataValue('response', JSON.stringify(uploaded.data))
         }
         // delete to prevent duplicates
         delete instance.user;
         delete instance.dataValues.user;
         delete instance.tenant;
         delete instance.dataValues.tenant;
         delete instance.product;
         delete instance.dataValues.product;
         delete instance.txn_headers;
         delete instance.dataValues.txn_headers;
      }
   });
   return Media;
};
