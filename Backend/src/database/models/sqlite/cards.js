'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class card extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         // define association here
         card.belongsTo(models.User, {
            foreignKey: 'userId',
         })
      }
   };
   card.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
      },
      userIid: DataTypes.UUID,
      gateway: DataTypes.STRING(50),
      card_details: {
         type: DataTypes.STRING,
         set(value) {
            this.setDataValue('card_details', JSON.stringify(value));
         },
         get() {
            return JSON.parse(this.getDataValue('card_details'));
         },
      },
      isActive: {
         type: DataTypes.BOOLEAN,
         defaultValue: true,
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'Card',
      tableName: 'cards',
   });
   return card;
};
