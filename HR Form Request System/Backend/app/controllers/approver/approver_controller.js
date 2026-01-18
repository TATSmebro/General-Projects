const { Op } = require("sequelize");

const { Approver, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const ApproverController = {
  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const approver = await Approver.create({
          'approver_name': req.body.approver_name,
          // 'created_by': req.user.id,
        }, {transaction: t});
        return res.status(CREATED).json({Approver: approver});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message})
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const approvers = await Approver.findAll({
          attributes: ['id', 'approver_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
        });
        return res.json(approvers);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const approver = await Approver.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'approver_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
          
          },
        );

        if (!approver) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(approver);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const approver = await Approver.findOne({
          where: {id: req.params.id}
        });

        if(!approver){
          return res.status(NOT_FOUND).json({message: "Approver Not Found"});          
        } 
        await approver.update({
          approver_name: req.body.approver_name,
          // updated_by: req.user.id
        }, {transaction: t});

        return res.status(OK).json({Approver: approver});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const approver = await Approver.findOne({
          where: {id: req.params.id}
        });

        if(!approver){
          return res.status(NOT_FOUND).json({message: "Approver Not Found"});          
        }
        
        await approver.destroy({
          // deleted_by: req.user.id
          force: false,
        }, {transaction: t});

        return res.status(OK).json({message: 'Approver Destroyed'});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});        
      }
    })
  }
};

module.exports.ApproverController = ApproverController;