'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Feedback extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Feedback.belongsTo(models.User, {
                foreignKey: "userId",
            })
        }
    };
    Feedback.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
        },
        issue: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        tableName: 'feedbacks',
        modelName: 'Feedback',
    });
    return Feedback;
};
