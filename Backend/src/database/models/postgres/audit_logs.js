'use strict';
const { Model } = require('sequelize');
const DBEnums = require('../../db-enums');
module.exports = (sequelize, DataTypes) => {
   class AuditLogs extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      getCommon(options) {
         if (!this.commonType) return Promise.resolve(null);
         const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
         return this[mixinMethodName](options);
      }
      static associate(models) {
         AuditLogs.belongsTo(models.User, {
            foreignKey: "maker",
            as: "Maker"
         });
         AuditLogs.belongsTo(models.User, {
            foreignKey: "checker",
            as: "Checker"
         });
         AuditLogs.belongsTo(models.TxnHeader, {
            foreignKey: 'commonId',
            constraints: false,
         });
         AuditLogs.belongsTo(models.Tenant, {
            foreignKey: 'tenantId',
         });
      }
   };
   AuditLogs.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
      },
      commonType: {
         type: DataTypes.STRING,
         allowNull: false
      },
      commonId: {
         type: DataTypes.UUID,
         allowNull: false
      },
      maker: {
         type: DataTypes.UUID,
      },
      status: {
         type: DataTypes.SMALLINT,
         defaultValue: 100,
         get() {
             const rawValue = this.getDataValue('status');
             return  DBEnums.AuditLogStatus.find(g=>g.code===rawValue).label
         },
         set(value) {
            const result = DBEnums.AuditLogStatus.find(g=>g.code===value)
                ? value
                : DBEnums.AuditLogStatus.find(g=>g.label===value).code;
             this.setDataValue('status', result);
         }
      },
      checker: {
         type: DataTypes.UUID,
      },
      action: {
         type: DataTypes.STRING,
      },
      url: {
         type: DataTypes.TEXT,
      },
      tenantId: {
         type: DataTypes.UUID,
         allowNull: false
      },
      data: {
         type: DataTypes.TEXT,
      },
   }, {
      sequelize,
      paranoid: false,
      underscored: true,
      timestamps: false ,
      tableName: 'audit_logs',
      modelName: 'AuditLogs',
   });
   AuditLogs.addHook('afterFind', (findResult) => {
      if (!Array.isArray(findResult)) findResult = [findResult];
      for (const instance of findResult) {
         if (instance.commonType === 'txn_headers' && instance.txn_headers !== undefined) {
         instance.common = instance.txn_headers;
         }
         // else if (instance.commonType === "txn_headers" && instance.txn_headers !== undefined) {
         //   instance.common = instance.txn_headers;
         // }
         // delete to prevent duplicates
         delete instance.txn_headers;
         delete instance.dataValues.txn_headers;
      }
   });
   return AuditLogs;
};


