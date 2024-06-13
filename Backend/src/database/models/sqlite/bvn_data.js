'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BvnData extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
            BvnData.belongsTo(models.User, {
                foreignKey: "userId",
            })
        }
    };
    BvnData.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: DataTypes.UUID,
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
         },
        bvn: DataTypes.STRING(15),
        bvnResponse: {
            type: DataTypes.JSONB,
            allowNull: true,
        }
    }, {
        sequelize,
        paranoid: false, //This ignores createdAt, updatedAt and deletedAt
        underscored: true,
        tableName: 'bvn_data',
        modelName: 'BvnData',
    });
    return BvnData;
};
