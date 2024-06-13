'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Faq extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
            // Beneficiary.belongsTo(models.User, {
            //     foreignKey: "user_id",
            // })
            // // Beneficiary.belongsTo(models.broker, {
            //     foreignKey: "brokerId",
            //     as: "broker"
            // })
      }
    };
    Faq.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        offerId: {
            type: DataTypes.UUID,
        },
        question: {
            type: DataTypes.TEXT,
        },
        answer: {
            type: DataTypes.TEXT,
        },
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        modelName: 'Faq',
        tableName: 'faqs',
    });
    return Faq;
};
