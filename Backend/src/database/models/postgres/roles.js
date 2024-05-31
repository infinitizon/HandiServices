'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Role extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         Role.hasMany(models.TenantUserRole, {
            foreignKey: "roleId",
         });
         // Role.belongsToMany(models.user, {
         //   through: models.tenant_user_roles,
         // });
      }
   };
   Role.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true
      },
      description: {
         type: DataTypes.STRING,
         allowNull: false
      },
   }, {
      sequelize,
      paranoid: false,
      underscored: true,
      timestamps: false ,
      tableName: 'roles',
      modelName: 'Role',
   });
   return Role;
};


