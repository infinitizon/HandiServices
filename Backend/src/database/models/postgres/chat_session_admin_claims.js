'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ChatSessionAdminClaim extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         ChatSessionAdminClaim.belongsTo(models.ChatSession, {
            foreignKey: 'sessionId',
         });
         ChatSessionAdminClaim.belongsTo(models.User, {
            foreignKey: 'userId',
         });
      }
   };
   ChatSessionAdminClaim.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      sessionId: DataTypes.UUID,
      userId: DataTypes.UUID,    //UserId of the user in Tenant
      isActive: DataTypes.BOOLEAN,
      sessionEnd: DataTypes.DATE,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'ChatSessionAdminClaim',
      tableName: 'chat_sessions_admin_claims',
   });
   return ChatSessionAdminClaim;
};


