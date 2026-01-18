const { Op } = require("sequelize");

const { FormType, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const FormTypeController = {
  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const form_type = await FormType.create({      
          'form_name': req.body.form_name,
        }, {transaction: t});
        
        return res.status(CREATED).json({FormType: form_type});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message})
      }
    })
  },

  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const form_types = await FormType.findAll({
          attributes: ['id', 'form_name', 'created_by', 'created_at', 'updated_by', 'updated_at']
        });
        return res.json(form_types);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },

  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const form_type = await FormType.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'form_name', 'created_by', 'created_at', 'updated_by', 'updated_at']
          
          },
        );

        if (!form_type) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(form_type);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },

  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const form_type = await FormType.findOne({
          where: { id: req.params.id }
        });

        if (!form_type) {
          return res.status(NOT_FOUND).json({ message: "Form Type Not Found" })
        }

        await form_type.update({
          form_name: req.body.form_name
        });

        return res.status(OK).json({FormType: form_type});

      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const form_type = await FormType.findOne({
          where: { id: req.params.id }
        })

        if (!form_type) {
          return res.status(NOT_FOUND).json({ message: 'Form Type Not Found' })
        }

        await form_type.destroy({
          force: false,
        }, {transaction: t});

        return res.status(OK).json({ message: 'Form Type Destroyed' })
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }

};


module.exports.FormTypeController = FormTypeController;