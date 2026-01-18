const { Op } = require("sequelize");

const { BookingDetails, UserProfile, Flier, Approver, PurposeOfTravel, FlightRequest, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');

const FlightRequestController = {
  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const flier_data = {
          "first_name": req.body.first_name,
          "middle_name": req.body.middle_name,
          "last_name": req.body.last_name,
          "birthday": req.body.birthday,
          "extensions": req.body.extensions,
          "title": req.body.title,
        };
        const flightRequest = await FlightRequest.create({
          'profile_id': req.body.profile_id,
          'purpose_id': req.body.purpose_id,
          'purpose_others': req.body.purpose_others,
          'start_business': req.body.start_business,
          'end_business': req.body.end_business,
          'departure_date': req.body.departure_date,
          'departure_time': req.body.departure_time,
          'departure_city': req.body.departure_city,
          'return_date': req.body.return_date,
          'return_time': req.body.return_time,
          'return_city': req.body.return_city,
          'approver_id': req.body.approver_id,
          'remarks': req.body.remarks,
          'booking_id': req.body.booking_id,
          'created_by': req.body.profile_id,
          'Flier': flier_data,
        }, 
        {
          include: [Flier]
        },
        {transaction: t});
        return res.status(CREATED).json({FlightRequest: flightRequest});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message})
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const flightRequests = await FlightRequest.findAll({
          attributes: [
            'id', 
            'profile_id', 
            'flier_id', 
            'purpose_id', 
            'purpose_others', 
            'start_business', 
            'end_business', 
            'departure_date', 
            'departure_time', 
            'departure_city', 
            'return_date', 
            'return_time', 
            'return_city', 
            'approver_id', 
            'remarks', 
            'booking_id', 
            'created_by', 
            'created_at', 
            'updated_by', 
            'updated_at',             
        ]
        });
        return res.json(flightRequests);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const flightRequest = await FlightRequest.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: [
                'id',
                'purpose_others', 
                'start_business', 
                'end_business', 
                'departure_date', 
                'departure_time', 
                'departure_city', 
                'return_date', 
                'return_time', 
                'return_city',
                'remarks', 
                'booking_id', 
                'created_by', 
                'created_at', 
                'updated_by', 
                'updated_at',             
            ],
            include: [
              {
              model: PurposeOfTravel,
              attributes: ['id', 'purpose_name'],
              },
              {
              model: Approver,
              attributes: ['id', 'approver_name'],
              },
              {
              model: Flier,
              attributes: ['id', 'first_name', 'middle_name', 'last_name', 'birthday', 'extensions', 'title'],
              },
              {
              model: UserProfile,
              attributes: ['id', 'first_name', 'middle_name', 'last_name', 'department_id', 'role_id', 'profile_photo'],
              },
              {
              model: BookingDetails,
              attributes: ['departure_ref_no', 'departure_cost', 'departure_ticket_path', 'return_ref_no', 'return_cost', 'return_ticket_path'],
              }
            ],
          },
        );

        if (!flightRequest) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });          
        }

        return res.status(OK).json(flightRequest);        
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });        
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const flightRequest = await FlightRequest.findOne({
          where: {id: req.params.id}
        });

        if(!flightRequest){
          return res.status(NOT_FOUND).json({message: "Flight Request Not Found"});          
        } 
        await flightRequest.update({
          profile_id: req.body.profile_id,
          flier_id: req.body.flier_id,
          purpose_id: req.body.purpose_id,
          purpose_others: req.body.purpose_others,
          start_business: req.body.start_business,
          end_business: req.body.end_business,
          departure_date: req.body.departure_date,
          departure_time: req.body.departure_time,
          departure_city: req.body.departure_city,
          return_date: req.body.return_date,
          return_time: req.body.return_time,
          return_city: req.body.return_city,
          approver_id: req.body.approver_id,
          remarks: req.body.remarks,
          booking_id: req.body.booking_id,
          // updated_by: req.user.id
        }, {transaction: t});

        return res.status(OK).json({FlightRequest: flightRequest});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const flightRequest = await FlightRequest.findOne({
          where: {id: req.params.id}
        });

        if(!flightRequest){
          return res.status(NOT_FOUND).json({message: "Flight Request Not Found"});          
        }
        
        await flightRequest.destroy({
          // deleted_by: req.user.id
          force: false,
        }, {transaction: t});

        return res.status(OK).json({message: 'Flight Request Destroyed'});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});        
      }
    })
  }
};

module.exports.FlightRequestController = FlightRequestController;