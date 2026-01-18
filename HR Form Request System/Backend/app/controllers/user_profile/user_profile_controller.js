const { Op } = require("sequelize");

const { UserProfile, sequelize, Department, Role } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const UserProfileController = {
  create: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_profile = await UserProfile.create({
          'first_name': req.body.first_name,
          'middle_name': req.body.middle_name,
          'last_name': req.body.last_name,
          'department_id': req.body.department_id,
          'role_id': req.body.role_id,
          'profile_photo': req.body.profile_photo,
        }, {transaction: t})
        return res.status(CREATED).json({ UserProfile: user_profile });
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user_profiles = await UserProfile.findAll({
          attributes: [
            'id', 
            'first_name', 
            'middle_name', 
            'last_name', 
            'department_id', 
            'role_id', 
            'profile_photo', 
          ],
          include: [
            {
              model: Department,
              attributes: [
                'id',
                'department_name'
              ],
            },
            {
              model: Role,
              attributes: [
                'id',
                'role_name'
              ]
            }
          ]
        });
        return res.json(user_profiles);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user_profile = await UserProfile.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: [
              'id', 
              'first_name', 
              'middle_name', 
              'last_name', 
              'profile_photo', 
            ],
            include: [
              {
                model: Department,
                attributes: [
                  'id',
                  'department_name'
                ],
              },
              {
                model: Role,
                attributes: [
                  'id',
                  'role_name'
                ]
              }
            ]
          
          },
        );

        if (!user_profile) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }

        return res.status(OK).json(user_profile);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_profile = await UserProfile.findOne({
          where: { id: req.params.id }
        });

        if (!user_profile) {
          return res.status(NOT_FOUND).json({ message: 'User Profile Not Found' })
        }

        await user_profile.update({
          first_name: req.body.first_name,
          middle_name: req.body.middle_name,
          last_name: req.body.last_name,
          department_id: req.body.department_id,
          role_id: req.body.role_id,
          profile_photo: req.body.profile_photo,
        }, {transaction: t})
        return res.status(OK).json({UserProfile: user_profile});
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  },
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_profile = await UserProfile.findOne({
          where: { id: req.params.id }
        });

        if (!user_profile) {
          return res.status(NOT_FOUND).json({ message: 'User Profile Not Found' });
        }

        await user_profile.destroy({
          force: false
        }, {transaction: t});

        return res.status(OK).json({ message: 'User Profile Destroyed' })
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }
};

module.exports.UserProfileController = UserProfileController;