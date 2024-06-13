'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Wallet extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         Wallet.belongsTo(models.User, {
            foreignKey: "userId",
         });
      }
   };
   Wallet.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      currency: DataTypes.STRING,
      total: DataTypes.DOUBLE,
      isEnabled: DataTypes.BOOLEAN,
      isLocked: DataTypes.BOOLEAN,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'Wallet',
      tableName: 'wallets',
   });
   return Wallet;
};


