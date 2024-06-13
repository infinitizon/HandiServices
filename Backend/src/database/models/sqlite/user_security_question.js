'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class UserSecurityQuestion extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         UserSecurityQuestion.belongsTo(models.User, {
            foreignKey: "userId",
         });
      }
   };
   UserSecurityQuestion.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      questionId: DataTypes.UUID,
      answer: DataTypes.TEXT,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'UserSecurityQuestion',
      tableName: 'user_security_questions',
   });
   return UserSecurityQuestion;
};


