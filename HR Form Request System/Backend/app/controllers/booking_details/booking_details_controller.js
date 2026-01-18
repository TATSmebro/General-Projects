const { Op } = require("sequelize");

const { BookingDetails, sequelize } = require("../../models");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const BookingDetailsController = {
  create: async (req, res) => {
    await sequelize.transaction(async(t) =>{
      try {
        const booking_details = await BookingDetails.create({
          'departure_ref_no': req.body.departure_ref_no,
          'departure_cost': req.body.departure_cost,
          'departure_ticket_path': req.body.departure_cost,
          'return_ref_no': req.body.return_ref_no,
          'return_cost': req.body.return_cost,
          'return_ticket_path': req.body.return_ticket_path,
        }, {transaction: t});
        return res.status(CREATED).json({BookingDetails: booking_details})
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const booking_details = await BookingDetails.findAll({
          attributes: ['id', 'departure_ref_no', 'departure_cost', 'departure_ticket_path', 'return_ref_no', 'return_cost', 'return_ticket_path', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
        });
        return res.json(booking_details);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const booking_details = await BookingDetails.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'departure_ref_no', 'departure_cost', 'departure_ticket_path', 'return_ref_no', 'return_cost', 'return_ticket_path', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']  
          },
        );

        if (!booking_details) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(booking_details);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const booking_details = await BookingDetails.findOne({
          where: { id: req.params.id}
        });

        if (!booking_details) {
          return res.status(NOT_FOUND).json({ message: 'Booking Details Not Found' });
        }

        await booking_details.update({
          departure_ref_no: req.body.departure_ref_no,
          departure_cost: req.body.departure_cost,
          departure_ticket_path: req.body.departure_ticket_path,
          return_ref_no: req.body.return_ref_no,
          return_cost: req.body.return_cost,
          return_ticket_path: req.body.return_ticket_path,
        }, {transaction: t});

        return res.status(OK).json({ BookingDetails: booking_details });
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const booking_details = await BookingDetails.findOne({
          where: { id: req.params.id }
        });

        if (!booking_details) {
          return res.status(NOT_FOUND).json({ message: 'Booking Details Not Found' })
        }

        await booking_details.destroy({
          force: false
        }, {transaction: t});

        return res.status(OK).json({ message: 'Booking Details Destroyed' });
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }
};

module.exports.BookingDetailsController = BookingDetailsController;