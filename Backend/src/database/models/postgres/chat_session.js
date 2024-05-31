'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ChatSession extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         ChatSession.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'Customer',
         });
         ChatSession.belongsTo(models.Tenant, {
            foreignKey: 'tenantId',
         });
         ChatSession.belongsTo(models.Order, {
            foreignKey: 'sessionId',
         });
         ChatSession.belongsTo(models.User, {
            foreignKey: 'claim',
            as: 'Admin',
         });
      }
   };
   ChatSession.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      tenantId: DataTypes.UUID,
      sessionId: DataTypes.UUID,
      claim: DataTypes.UUID, //UserId of the user in Tenant
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'ChatSession',
      tableName: 'chat_sessions',
   });
   return ChatSession;
};


