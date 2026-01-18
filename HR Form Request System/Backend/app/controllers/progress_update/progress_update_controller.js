const { Op } = require("sequelize");

const { ProgressUpdate, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const ProgressUpdateController = {
  create: async(req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const progress_update = await ProgressUpdate.create({
          'request_id': req.body.request_id,
          'status_id': req.body.status_id,
        }, {transaction: t});

        return res.status(CREATED).json({ProgressUpdate: progress_update});
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const progress_updates = await ProgressUpdate.findAll({
          attributes: ['id', 'request_id', 'status_id', 'created_by', 'created_at']
        });
        return res.json(progress_updates);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const progress_update = await ProgressUpdate.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'request_id', 'status_id', 'created_by', 'created_at']
          
          },
        );

        if (!progress_update) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(progress_update);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const progress_update = await ProgressUpdate.findOne({
          where: { id: req.params.id }
        });

        if (!progress_update) {
          return res.status(NOT_FOUND).json({ message: "Progress Update Not Found" })
        }

        await progress_update.update({
          request_id: req.body.request_id,
          status_id: req.body.status_id,
        });

        return res.status(OK).json({ProgressUpdate: progress_update});

      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const progress_update = await ProgressUpdate.findOne({
          where: { id: req.params.id }
        })

        if (!progress_update) {
          return res.status(NOT_FOUND).json({ message: 'Progress Update Not Found' })
        }

        await progress_update.destroy({
          force: false,
        }, {transaction: t});

        return res.status(OK).json({ message: 'Progress Update Destroyed' })
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }
};

module.exports.ProgressUpdateController = ProgressUpdateController;