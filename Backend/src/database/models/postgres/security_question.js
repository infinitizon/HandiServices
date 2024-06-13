'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class SecurityQuestion extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         SecurityQuestion.belongsToMany(models.User, {
            through: models.UserSecurityQuestion,
            foreignKey: 'questionId',
            as: 'SecurityQuestion'
         });
      }
   };
   SecurityQuestion.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      label: DataTypes.UUID,
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'SecurityQuestion',
      tableName: 'security_questions',
   });
   return SecurityQuestion;
};


