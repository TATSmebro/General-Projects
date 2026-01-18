'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserCredentials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.UserCredentials.belongsTo(models.UserProfile, {
        foreignKey: "profile_id",
      })
    }
  }
  UserCredentials.init(
    {
      profile_id: DataTypes.INTEGER,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
    }, 
    {
    sequelize,
    modelName: 'UserCredentials',
    }
  );
  return UserCredentials;
};