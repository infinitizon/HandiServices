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
         });
         ChatSession.belongsTo(models.Tenant, {
            foreignKey: 'tenantId',
         });
         ChatSession.belongsTo(models.Order, {
            foreignKey: 'orderId',
         });
         ChatSession.hasMany(models.ChatSessionAdminClaim, {
            foreignKey: 'sessionId',
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
      orderId: DataTypes.UUID,
      tenantId: DataTypes.UUID,
      userId: DataTypes.UUID,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'ChatSession',
      tableName: 'chat_sessions',
   });
   return ChatSession;
};


