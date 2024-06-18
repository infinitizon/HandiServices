'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
    class TxnHeader extends Model {
        getCommon(options) {
           if (!this.commonType) return Promise.resolve(null);
           const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
           return this[mixinMethodName](options);
        }
        static associate(models) {
            TxnHeader.hasMany(models.TxnDetail, {
                foreignKey: "txnHeaderId",
            })
            TxnHeader.belongsTo(models.Product, {
               foreignKey: 'commonId',
               constraints: false,
            });
            TxnHeader.belongsTo(models.Order, {
               foreignKey: 'commonId',
               constraints: false,
            });
            TxnHeader.belongsTo(models.User, {
                foreignKey: "userId",
            })
            TxnHeader.belongsTo(models.Tenant, {
                foreignKey: "tenantId",
            })
            TxnHeader.hasMany(models.Media, {
                foreignKey: 'commonId',
                constraints: false,
                scope: {
                    common_type: 'txn_headers',
                },
            });
            TxnHeader.hasMany(models.AuditLogs, {
                foreignKey: 'commonId',
                constraints: false,
                scope: {
                    common_type: 'txn_headers',
                },
            });
            
        }
    };
    TxnHeader.init({
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        reference: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        commonType: {
           type: DataTypes.STRING,
           allowNull: false
        },
        commonId: {
           type: DataTypes.UUID,
           allowNull: false
        },
        tenantId: DataTypes.UUID,
        userId: {
            allowNull: false,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        gatewayReference: DataTypes.STRING(100),
        gatewayResponse: DataTypes.TEXT,
        description: DataTypes.STRING(500),
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'NGN'
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
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
        type: {
            type: DataTypes.SMALLINT,
            get() {
                const rawValue = this.getDataValue('type');
                return  DBEnums.TxnHeaderType.find(g=>g.code===rawValue)?.label
            },
            set(value) {
               const result = DBEnums.TxnHeaderType.find(g=>g.code===value)
                   ? value
                   : DBEnums.TxnHeaderType.find(g=>g.label===value).code;
                this.setDataValue('type', result);
            }
        },
        //source of transaction, wallet, online, access, ....
        source: {
            type: DataTypes.STRING(20),
            defaultValue: 'eipo'
        },
        //transaction channel, tradein, savein, planin, investin, eipo,learning....
        channel: {
            type: DataTypes.STRING(20),
            defaultValue: 'online'
        },
        module: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
    }, {
        sequelize,
        paranoid: true,
        underscored: true,
        tableName: 'txn_headers',
        modelName: 'TxnHeader',
    });
    //Added to prevent duplicate issues during eager loading.
    TxnHeader.addHook('afterFind', (findResult) => {
       if (!Array.isArray(findResult)) findResult = [findResult];
       for (const instance of findResult) {
          if (instance.commonType === "order" && instance.order !== undefined) {
             instance.common = instance.order;
          } else if (instance.commonType === "product" && instance.product !== undefined) {
             instance.common = instance.product;
          }
          // delete to prevent duplicates
          delete instance.order;
          delete instance.dataValues.order;
          delete instance.product;
          delete instance.dataValues.product;
       }
    });
    return TxnHeader;
};
