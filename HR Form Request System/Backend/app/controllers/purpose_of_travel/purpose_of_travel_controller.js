const { Op } = require("sequelize");

const { PurposeOfTravel, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');
const { message } = require("mailersend/src/modules/messages");


const PurposeOfTravelController = {

  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const purposeOfTravels = await PurposeOfTravel.create({
          'purpose_name': req.body.purpose_name,
          // 'created_by': req.user.id,
        }, {transaction: t});
        return res.status(CREATED).json({PurposeOfTravels: purposeOfTravels});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});         
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const purposes = await PurposeOfTravel.findAll({
          attributes: ['id', 'purpose_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']

        });
        return res.json(purposes);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});        
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const purpose = await PurposeOfTravel.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'purpose_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
          
          },
        );

        if (!purpose) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(purpose);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const purpose = await PurposeOfTravel.findOne({
          where: {id: req.params.id}
        });

        if(!purpose){
          return res.status(NOT_FOUND).json({message: "Purpose Not Found"});
        } 
        await purpose.update({
          purpose_name: req.body.purpose_name,
          // updated_by: req.user.id
        }, {transaction: t});

        return res.status(OK).json({PurposeOfTravel: purpose});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});        
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const purpose = await PurposeOfTravel.findOne({
          where: {id: req.params.id}
        });

        if(!purpose){
          return res.status(NOT_FOUND).json({message: "Purpose Not Found"});
        }
        
        await purpose.destroy({
          // deleted_by: req.user.id
          force: false,
        }, {transaction: t});

        return res.status(OK).json({message: 'Purpose Destroyed'});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});        
      }
    })
  }
};

module.exports.PurposeOfTravelController = PurposeOfTravelController;