const { Op } = require("sequelize");

const { Flier, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const FlierController = {
  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const flier = await Flier.create({
          'first_name': req.body.first_name,
          'middle_name': req.body.middle_name,
          'last_name': req.body.last_name,
          'birthday': req.body.birthday,
          'extensions': req.body.extensions,
          'title': req.body.title,
        }, {transaction: t});
        return res.status(CREATED).json({Flier: flier});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const fliers = await Flier.findAll({
          attributes: ['id', 'first_name', 'middle_name', 'last_name', 'birthday', 'extensions', 'title', 'created_at', 'created_by', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
        });
        return res.json(fliers);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const flier = await Flier.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'first_name', 'middle_name', 'last_name', 'birthday', 'extensions', 'title', 'created_at', 'created_by', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
          
          },
        );

        if (!flier) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(flier);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const flier = await Flier.findOne({
          where: {id: req.params.id}
        });

        if(!flier){
          return res.status(NOT_FOUND).json({message: "Flier Not Found"});
        } 
        await flier.update({
          first_name: req.body.first_name,
          middle_name: req.body.middle_name,
          last_name: req.body.last_name,
          birthday: req.body.birthday_name,
          extensions: req.body.extensions_name,
          title: req.body.title_name,
          // updated_by: req.user.id
        }, {transaction: t});

        return res.status(OK).json({Flier: flier});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const flier = await Flier.findOne({
          where: {id: req.params.id}
        });

        if(!flier){
          return res.status(NOT_FOUND).json({message: "Flier Not Found"});
        }
        
        await flier.destroy({
          // deleted_by: req.user.id
          force: false,
        }, {transaction: t});

        return res.status(OK).json({message: 'Flier Destroyed'});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});
      }
    })
  }
};

module.exports.FlierController = FlierController;