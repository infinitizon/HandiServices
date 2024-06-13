'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Tenant extends Model {
      /**
      * Helper method for defining associations.
      * This method is not a part of DataTypes lifecycle.
      * The `models/index` file will call this method automatically.
      */
      static associate(models) {
         Tenant.hasMany(models.Media, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'tenant',
            },
         });
         Tenant.hasMany(models.Address, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'tenant',
            },
         });
         Tenant.belongsToMany(models.Product, {
            through: models.TenantCategory,
            foreignKey: 'tenantId',
         });
         Tenant.hasMany(models.TenantUserRole, {
            foreignKey: 'tenantId',
         });
         Tenant.hasMany(models.TxnHeader, {
            foreignKey: 'tenantId',
         });
         Tenant.hasMany(models.AuditLogs, {
            foreignKey: 'tenantId',
         });
         Tenant.hasMany(models.ProductVendorCharacter, {
            foreignKey: 'vendorId',
         });
         Tenant.hasMany(models.Order, {
            foreignKey: 'tenantId',
         });
         Tenant.hasMany(models.ChatSession, {
            foreignKey: 'tenantId',
         });
      }
   };
   Tenant.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      pId: DataTypes.UUID,
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      email: {
         type: DataTypes.STRING(200),
         unique: true,
      },
      phone: DataTypes.STRING(20),
      summary: DataTypes.STRING(1000),
      isEnabled: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      },
      isLocked: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'Tenant',
      tableName: 'tenants',
   });
   return Tenant;
};


