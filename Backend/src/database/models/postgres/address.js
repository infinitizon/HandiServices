'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Address extends Model {
      getCommon(options) {
         if (!this.commonType) return Promise.resolve(null);
         const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
         return this[mixinMethodName](options);
      }
      static associate(models) {
         Address.belongsTo(models.User, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Address.belongsTo(models.Tenant, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Address.belongsToMany(models.Order, {
            through: models.OrderAddress,
            foreignKey: 'addressId',
            as: 'Orders'
         });
      }
   };
   Address.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      commonType: {
         type: DataTypes.STRING,
         allowNull: false
      },
      commonId: {
         type: DataTypes.UUID,
         allowNull: false
      },
      phone: DataTypes.STRING(20),
      houseNo: DataTypes.STRING(20),
      address1: DataTypes.STRING(100),
      address2: DataTypes.STRING(100),
      address3: DataTypes.STRING(100),
      city: DataTypes.STRING(100),
      lga: DataTypes.STRING(100),
      country: DataTypes.STRING(3),
      state: DataTypes.STRING(100),
      lat: DataTypes.DOUBLE,
      lng: DataTypes.DOUBLE,
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'addresses',
      modelName: 'Address',
   });
   //Added to prevent duplicate issues during eager loading.
   Address.addHook('afterFind', (findResult) => {
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'user' && instance.user !== undefined) {
            instance.common = instance.user;
         } else if (instance.commonType === "tenant" && instance.tenant !== undefined) {
            instance.common = instance.tenant;
         }
         // delete to prevent duplicates
         delete instance.user;
         delete instance.dataValues?.user;
         delete instance.tenant;
         delete instance.dataValues?.tenant;
      }
   });
   return Address;
};


