'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Beneficiary extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
            Beneficiary.belongsTo(models.User, {
                foreignKey: "userId",
            })
            // Beneficiary.belongsTo(models.broker, {
            //     foreignKey: "brokerId",
            //     as: "broker"
            // })
      }
    };
    Beneficiary.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: DataTypes.UUID,
        accountNumber: {
            type: DataTypes.STRING(15),
        },
        bankCode: {
            type: DataTypes.STRING(10),
        },
        accountName: {
            type: DataTypes.STRING,
        },
        bankName: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        modelName: 'Beneficiary',
        tableName: 'beneficiaries',
    });
    return Beneficiary;
};
