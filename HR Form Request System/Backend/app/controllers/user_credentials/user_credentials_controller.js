const { Op } = require("sequelize");

const { Department, Role, UserCredentials, sequelize, UserProfile } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');



const UserCredentialsController = {
  create: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_profile = {
          'first_name': req.body.first_name,
          'middle_name': req.body.middle_name,
          'last_name': req.body.last_name,
          'department_id': req.body.department_id,
          'role_id': req.body.role_id,
          'profile_photo': req.body.profile_photo,
        }
        const user_credentials = await UserCredentials.create(
          {
            'username': req.body.username,
            'password': req.body.password,
            'email': req.body.email,
            'phone': req.body.phone,
            'UserProfile': user_profile,
          },
          { include: [UserProfile] }, { transaction: t }
        );
        return res.status(CREATED).json({UserCredentials: user_credentials})
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user_credentials = await UserCredentials.findAll({
          attributes: ['id','username','password','email','phone'],
          include: [
            {
              model: UserProfile,
              attributes: ['id','first_name','middle_name','last_name','profile_photo'],
              include: [
                {
                  model: Department,
                  attributes: ['id','department_name']
                },
                {
                  model: Role,
                  attributes: ['id','role_name']
                }
              ]
            }
          ]
        });
      
        const formatted_users = user_credentials.map(account => {
          const profile = account.UserProfile
          return {
            id: account.id,
            username: account.username,
            password: account.password,
            email: account.email,
            phone: account.phone,
            profile_id: profile?.id,
            first_name: profile?.first_name,
            middle_name: profile?.middle_name,
            last_name: profile?.last_name,
            department_id: profile?.Department?.id,
            department_name: profile?.Department?.department_name,
            role_id: profile?.Role?.id,
            role_name: profile?.Role?.role_name,
            profile_photo: profile?.profile_photo,
          }
        })
        return res.json(formatted_users);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user_credentials = await UserCredentials.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id','username','password','email','phone'],
            include: [
              {
                model: UserProfile,
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
                ],
              }
            ]
          },
        );

        if (!user_credentials) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
        }
        
        return res.status(OK).json(user_credentials);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_credentials = await UserCredentials.findOne({
          where: { id: req.params.id }
        });

        const user_profile = await UserProfile.findOne({
          where: { id: req.body.profile_id }
        });

        if (!user_credentials || !user_profile) {
          return res.status(NOT_FOUND).json({ message: 'User Not Found' });
        }

        await user_credentials.update({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          phone: req.body.phone,
        }, { transaction: t })

        await user_profile.update({
          first_name: req.body.first_name,
          middle_name: req.body.middle_name,
          last_name: req.body.last_name,
          department_id: req.body.department_id,
          role_id: req.body.role_id,
          profile_photo: req.body.profile_photo,
        }, { transaction: t })

        return res.status(OK).json({UserCredentials: user_credentials});
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction(async(t) => {
      try {
        const user_credentials = await UserCredentials.findOne({
          where: { id: req.params.id }
        })

        const user_profile = await UserProfile.findOne({
          where: { id: user_credentials.profile_id }
        })

        if (!user_credentials || !user_profile) {
          return res.status(NOT_FOUND).json({ message: 'User Not Found' })
        }

        await user_credentials.destroy({
          force: false
        })

        await user_profile.destroy({
          force: false
        })
        return res.status(OK).json({ message: 'User Destroyed' })
      } catch(error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message })
      }
    });
  }
};

module.exports.UserCredentialsController = UserCredentialsController;