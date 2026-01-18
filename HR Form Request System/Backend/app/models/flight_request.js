'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FlightRequest.belongsTo(models.PurposeOfTravel, {
        foreignKey: 'purpose_id',
      });
      FlightRequest.belongsTo(models.Approver, {
        foreignKey: 'approver_id',
      });
      FlightRequest.belongsTo(models.Flier, {
        foreignKey: 'flier_id',
      });
      FlightRequest.belongsTo(models.UserProfile, {
        foreignKey: 'profile_id',
      });
      FlightRequest.belongsTo(models.BookingDetails, {
        foreignKey: 'booking_id',
      });
      FlightRequest.hasOne(models.Request, {
        foreignKey: 'form_request_id',
      })
    }
  }
  FlightRequest.init({
    profile_id: DataTypes.INTEGER,
    flier_id: DataTypes.INTEGER,
    purpose_id: DataTypes.INTEGER,
    purpose_others: DataTypes.STRING,
    start_business: DataTypes.DATE,
    end_business: DataTypes.DATE,
    departure_date: DataTypes.DATE,
    departure_time: DataTypes.STRING,
    departure_city: DataTypes.STRING,
    return_date: DataTypes.DATE,
    return_time: DataTypes.STRING,
    return_city: DataTypes.STRING,
    approver_id: DataTypes.INTEGER,
    remarks: DataTypes.TEXT,
    booking_id: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'FlightRequest',
  });
  return FlightRequest;
};