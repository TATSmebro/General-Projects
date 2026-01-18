"use strict";
const { Model } = require("sequelize");

const TokenService = require("../services/token/token_service");

module.exports = (sequelize, DataTypes) => {
  class UserAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    validatePassword(password) {
      if (this.password !== password) return false;

      return true;
    }

    async generateToken(id) {
      const token = TokenService.generateToken(id);
      this.token = token;
      this.verified_at = new Date(Date.now()).toISOString();
      await this.save();
      return token;
    }

    static associate(models) {
      // models.UserAccount.hasOne(models.Teacher, {
      //   foreignKey: "user_account_id",
      // }),
      //   models.UserAccount.hasOne(models.Admin, {
      //     foreignKey: "user_account_id",
      //   }),
      //   models.UserAccount.hasOne(models.Student, {
      //     foreignKey: "user_account_id",
      //   });
    }
  }
  UserAccount.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: DataTypes.STRING,
      role_id: DataTypes.INTEGER,
      profile_image: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
      token: {
        type: DataTypes.STRING,
      },
      verified_at: {
        type: DataTypes.DATE,
      },
    },
    {
      hooks: {
        beforeCreate: async (user_account, options) => {
          const isExist = await UserAccount.findOne({
            where: {
              username: user_account.username,
            },
          });

          if (isExist) {
            throw new Error("User Already Exists.");
          }
        },
        /*         beforeUpdate: async (user_account, options) => {
                  const { Op } = require("sequelize");
                  const isExist = await UserAccount.findOne({
                    where: {
                      id: {
                        [Op.ne]: user_account.id,
                      },
                      username: user_account.username,
                    },
                  });
        
                  if (isExist) {
                    throw new Error("User Already Exists.");
                  }
                }, */
        afterDestroy: (user_account, options) => {
          user_account.deleted_by = options.deleted_by;
          user_account.save();
        },
      },
      sequelize,
      modelName: "UserAccount",
      paranoid: true,
      underscored: true,
    }
  );

  return UserAccount;
};
