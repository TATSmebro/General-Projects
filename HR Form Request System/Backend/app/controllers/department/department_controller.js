const { Op } = require("sequelize");

const { Department, sequelize } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const DepartmentController = {
  create: async(req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const department = await Department.create({
          'department_name': req.body.department_name,
        }, {transaction: t});

        return res.status(CREATED).json({Departments: department});
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const departments = await Department.findAll({
          attributes: ['id', 'department_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
        });
        return res.json(departments);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const department = await Department.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'department_name', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
          
          },
        );

        if (!department) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(department);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const department = await Department.findOne({
          where: { id: req.params.id }
        });

        if (!department) {
          return res.status(NOT_FOUND).json({ message: "Department Not Found" })
        }

        await department.update({
          department_name: req.body.department_name
        });

        return res.status(OK).json({Department: department});

      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const department = await Department.findOne({
          where: { id: req.params.id }
        })

        if (!department) {
          return res.status(NOT_FOUND).json({ message: 'Department Not Found' })
        }

        await department.destroy({
          force: false,
        }, {transaction: t});

        return res.status(OK).json({ message: 'Department Destroyed' })
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }
};

module.exports.DepartmentController = DepartmentController;