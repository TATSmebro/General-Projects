const { Op } = require("sequelize");

const { StatusType, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const StatusTypeController = {
    create: async (req, res) => {
        await sequelize.transaction(async (t) => {
            try {
            const { status_name, created_by } = req.body;
        
            const newStatusType = await StatusType.create(
                { status_name, created_by },
                { transaction: t }
            );
        
            return res.status(CREATED).json(newStatusType);
            } catch (error) {
              res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
              return;
            }
        });
    },
        
    all: async (req, res) => {
        await sequelize.transaction(async (t) => {
            try {
            const status_types = await StatusType.findAll({
                attributes: ['id', 'status_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
            });
            return res.json(status_types);
            } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
            return;
            }
        });
    },
    get: async (req, res) => {
        await sequelize.transaction(async (t) => {
            try {
            const status_type = await StatusType.findOne(
                {
                where: {
                    id: req.params.id,
                },
                attributes: ['id', 'status_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
                
                },
            );

            if (!status_type) {
                res.status(NOT_FOUND).json({
                message: `No matching record with ${req.params.id}`,
                });
                return;
            }

            
            return res.status(OK).json(status_type);
            } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
            return;
            }
        });
    },
    update: async (req, res) => {
        await sequelize.transaction(async (t) => {
          try {
            const { id } = req.params;
            const { status_name, updated_by } = req.body;
      
            const status_type = await StatusType.findByPk(id);
      
            if (!status_type) {
              return res.status(NOT_FOUND).json({ message: "Not found" });
            }
      
            await status_type.update({ status_name, updated_by }, { transaction: t });
      
            return res.status(OK).json(status_type);
          } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
            return;
          }
        });
      },
      delete: async (req, res) => {
        await sequelize.transaction(async (t) => {
          try {
            const { id } = req.params;
            const { deleted_by } = req.body;
      
            const status_type = await StatusType.findByPk(id);
      
            if (!status_type) {
              return res.status(NOT_FOUND).json({ message: "Not found" });
            }
      
            await status_type.destroy(
              { 
                // deleted_at: new Date(), deleted_by 
                force: false
              },
              { transaction: t }
            );
      
            return res.status(OK).json({ message: "Deleted successfully" });
          } catch (error) {
            res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
            return;
          }
        });
      }      
};

module.exports.StatusTypeController = StatusTypeController;