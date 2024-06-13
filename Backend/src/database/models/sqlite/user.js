'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
   class User extends Model {
      static UserGender = {
          100: 'male', 
          101: 'female',
          102: 'other',
      }
      /**
       * Helper method for defining associations.
       * This method is not a part of DataTypes lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
         User.hasMany(models.Media, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'user',
            },
         });
         User.hasMany(models.Address, {
            foreignKey: 'commonId',
            constraints: false,
            scope: {
               commonType: 'user',
            },
         });
         User.hasMany(models.TenantUserRole, {
            foreignKey: 'userId',
         });
         User.hasMany(models.TxnDetail, {
            foreignKey: "userId",
         });
         User.hasMany(models.TxnHeader, {
            foreignKey: "userId",
         });
         User.hasMany(models.Card, {
            foreignKey: "userId",
         });
         User.hasMany(models.Token, {
            foreignKey: "userId",
         });
         User.hasMany(models.Beneficiary, {
            foreignKey: "userId",
         });
         User.hasMany(models.NextOfKin, {
            foreignKey: "userId",
         });
         User.hasMany(models.Order, {
            foreignKey: "userId",
         });
         User.hasMany(models.Feedback, {
            foreignKey: "userId",
         });
         User.hasMany(models.ChatSession, {
            foreignKey: "userId",
            as: 'Customer',
         });
         User.hasMany(models.ChatSession, {
            foreignKey: "claim",
            as: 'Admin',
         });
         User.hasMany(models.ChatMessage, {
            foreignKey: "userId",
         });
         User.belongsToMany(models.SecurityQuestion, {
            through: models.UserSecurityQuestion,
            foreignKey: 'userId',
            as: 'User'
         });
      }
   };
   User.init({
      id: {
         allowNull: false,
         primaryKey: true,
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4
      },
      pId: DataTypes.UUID,
      bvn: {
         type: DataTypes.STRING(13),
         unique: true,
         allowNull: true,
      },
      refCode: {
         type: DataTypes.STRING(20),
      },
      referrer: DataTypes.STRING(20),
      firstName: {
         type: DataTypes.STRING(100),
      },
      middleName: {
         type: DataTypes.STRING(100),
      },
      lastName: {
         type: DataTypes.STRING(100),
      },
      email: {
         type: DataTypes.STRING(200),
         allowNull: false,
         unique: true
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false
      },
      deviceToken: {
         type: DataTypes.STRING,
      },
      dob: DataTypes.DATEONLY,
      phone: DataTypes.STRING(20),
      gender: {        
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 102,
        get() {
            const rawValue = this.getDataValue('gender');
            return User.UserGender[rawValue]
        },
        set(value) {
            const result = Object.keys(User.UserGender).includes(value)
                ? value
                : getKeyByValue(User.UserGender, value);
            this.setDataValue('gender', result);
        }
      },
      //tier can be [1-->Register,2-->BVN ,3-->Address]
      tier: {
         type: DataTypes.INTEGER,
         defaultValue: 1,
      },
      uuidToken: {
         type: DataTypes.STRING(500),
      },
      showBalance: {
         type: DataTypes.BOOLEAN,
         defaultValue: true
      },
      isEnabled: {
         type: DataTypes.BOOLEAN,
      },
      isLocked: {
         type: DataTypes.BOOLEAN,
      },
      firstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      twoFactorAuth: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
   }, {
      sequelize,
      paranoid: true,
      underscored: true,
      modelName: 'User',
      tableName: 'users',
   });
   return User;
};


