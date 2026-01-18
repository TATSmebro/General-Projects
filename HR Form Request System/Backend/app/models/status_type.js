'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StatusType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StatusType.hasMany(models.Request, {
        foreignKey: 'status_id',
      });
    }
  }
  StatusType.init({
    status_name: {
      type: DataTypes.STRING,
      allow_null: true,
    } ,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'StatusType',
  });
  return StatusType;
};

