'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class ChatMessage extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         ChatMessage.belongsTo(models.User, {
            foreignKey: 'userId',
         });
      }
   };
   ChatMessage.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      pId: DataTypes.UUID,
      sessionId: DataTypes.UUID,
      userId: DataTypes.UUID,
      message: DataTypes.TEXT,
      isDeleted: {
         type: DataTypes.BOOLEAN,
         defaultValue: false
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'ChatMessage',
      tableName: 'chat_messages',
   });
   return ChatMessage;
};


