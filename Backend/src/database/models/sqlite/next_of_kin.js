'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class NextOfKin extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         NextOfKin.belongsTo(models.User, {
            foreignKey: 'userId',
         });
      }
   };
   NextOfKin.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      relationship: {
         type: DataTypes.STRING(20),
      },
      name: {
         type: DataTypes.STRING,
      },
      phone: {
         type: DataTypes.STRING(20),
      },
      email: {
         type: DataTypes.STRING(200),
      },
      address: {
         type: DataTypes.STRING,
      },
      isPrimary: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
      isEnabled: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      },
      isLocked: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'NextOfKin',
      tableName: 'next_of_kins',
   });
   return NextOfKin;
};


