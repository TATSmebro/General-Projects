'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BookingDetails.hasOne(models.FlightRequest, {
        foreignKey: 'booking_id',
      });
    }
  }
  BookingDetails.init(
    {
      departure_ref_no: DataTypes.STRING,
      departure_cost: DataTypes.DECIMAL,
      departure_ticket_path: DataTypes.STRING,
      return_ref_no: DataTypes.STRING,
      return_cost: DataTypes.DECIMAL,
      return_ticket_path: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
    }, 
    {
      sequelize,
      modelName: 'BookingDetails',
    }
  );
  
  return BookingDetails;
};