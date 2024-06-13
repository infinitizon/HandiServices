'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class TenantUserRole extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         TenantUserRole.belongsTo(models.Role, {
            foreignKey: 'roleId',
         })
         TenantUserRole.belongsTo(models.User, {
            foreignKey: 'userId',
         });
         TenantUserRole.belongsTo(models.Tenant, {
            foreignKey: 'tenantId',
         });
      }
   };
   TenantUserRole.init({
      tenantId: {
         type: DataTypes.UUID,
         primaryKey: true,
      },
      userId: {
         type: DataTypes.UUID,
         primaryKey: true,
      },
      roleId: {
         type: DataTypes.UUID,
         primaryKey: true,
      },
   }, {
      sequelize,
      // indexes: [
      //   {
      //     name: 'unique_index',
      //     unique: true,
      //     fields: ['user_id', 'tenant_id', 'role_id']
      //   }
      // ],
      paranoid: true,
      underscored: true,
      timestamps: false ,
      modelName: 'TenantUserRole',
      tableName: 'tenant_user_roles',
   });
   return TenantUserRole;
};


