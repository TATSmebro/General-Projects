'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserProfile.belongsTo(models.Department, {
        foreignKey: "department_id",
      }),
      UserProfile.belongsTo(models.Role, {
        foreignKey: "role_id",
      }),
      UserProfile.hasOne(models.UserCredentials, {
        foreignKey: "profile_id",
      }),
      models.UserProfile.hasMany(models.Notification, {
        foreignKey: "profile_id",
      }),
      UserProfile.hasMany(models.FlightRequest, {
        foreignKey: 'profile_id',
      });
    }
  }
  UserProfile.init(
    {
      first_name: DataTypes.STRING,
      middle_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      department_id: DataTypes.INTEGER,
      role_id: DataTypes.INTEGER,
      profile_photo: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
    }, 
    {
      sequelize,
      modelName: 'UserProfile',
    }
  );
  return UserProfile;
};