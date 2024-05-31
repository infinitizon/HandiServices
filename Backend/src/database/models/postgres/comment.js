'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class Comment extends Model {
      getCommon(options) {
         if (!this.commonType) return Promise.resolve(null);
         const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
         return this[mixinMethodName](options);
      }
      static associate(models) {
         Comment.belongsTo(models.User, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Comment.belongsTo(models.Tenant, {
            foreignKey: 'commonId',
            constraints: false,
         });
         Comment.belongsTo(models.User, {
            foreignKey: 'userId',
         });
      }
   };
   Comment.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      userId: DataTypes.UUID,
      commonType: {
         type: DataTypes.STRING,
         allowNull: false
      },
      commonId: {
         type: DataTypes.UUID,
         allowNull: false
      },
      rating: DataTypes.STRING(20),
      subject: DataTypes.STRING(100),
      comment: DataTypes.STRING(100),
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      tableName: 'comments',
      modelName: 'Comment',
   });
   //Added to prevent duplicate issues during eager loading.
   Comment.addHook('afterFind', (findResult) => {
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'user' && instance.user !== undefined) {
            instance.common = instance.user;
         } else if (instance.commonType === "tenant" && instance.tenant !== undefined) {
            instance.common = instance.tenant;
         }
         // delete to prevent duplicates
         delete instance.user;
         delete instance.dataValues.user;
         delete instance.tenant;
         delete instance.dataValues.tenant;
      }
   });
   return Comment;
};


