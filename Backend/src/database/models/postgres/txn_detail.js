'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TxnDetail extends Model {
        static TxnDetailStatus = {
            100: 'pending', 
            101: 'failed',
            102: 'success',
            103: 'reversed',
            104: 'abandoned',
            105: 'pending_approval',
        }
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
                return TxnDetail.TxnDetailStatus[rawValue]
            },
            set(value) {
                const result = Object.keys(TxnDetail.TxnDetailStatus).includes(value)
                    ? value
                    : getKeyByValue(TxnDetail.TxnDetailStatus, value);
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
