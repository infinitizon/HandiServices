'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
    class TxnDetail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            TxnDetail.belongsTo(models.User, {
                foreignKey: "userId",
            })
            TxnDetail.belongsTo(models.TxnHeader, {
                foreignKey: "txnHeaderId",
            })
        }
    };
    TxnDetail.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        txnHeaderId: {
            allowNull: false,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            allowNull: false,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'NGN'
        },
        unit: {
            type: DataTypes.FLOAT,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        description: DataTypes.STRING(500),
        status: {
            type: DataTypes.SMALLINT,
            defaultValue: 100,
            get() {
                const rawValue = this.getDataValue('status');
                return  DBEnums.TxnStatus.find(g=>g.code===rawValue).label
            },
            set(value) {
               const result = DBEnums.TxnStatus.find(g=>g.code===value)
                   ? value
                   : DBEnums.TxnStatus.find(g=>g.label===value).code;
                this.setDataValue('status', result);
            }
        },
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        tableName: 'txn_details',
        modelName: 'TxnDetail',
    });
    return TxnDetail;
};
