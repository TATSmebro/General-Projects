const { Op } = require("sequelize");

const { Notification, sequelize, UserProfile } = require("../../models/");

const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const NotificationController = {
  create: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try{
        const notification = await Notification.create({      
          'profile_id': req.body.profile_id,
          'message': req.body.message,
          'is_read': req.body.is_read,
          // 'created_by': req.user.id,
        }, {transaction: t});
        return res.status(CREATED).json({Notification: notification});
      } catch(error){
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message})
      }
    })
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const notifications = await Notification.findAll({
          attributes: [
            'id', 
            'message', 
            'is_read', 
            'created_by', 
            'created_at', 
          ],
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
                'profile_photo'
              ]
            }
          ]
        });
        return res.json(notifications);
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({message: error.message});
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const notification = await Notification.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: [
              'id', 
              'message', 
              'is_read', 
              'created_by', 
              'created_at', 
            ],
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
                  'profile_photo'
                ]
              }
            ]
          },
        );

        if (!notification) {
          return res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });          
        }

        return res.status(OK).json(notification);        
      } catch (error) {
        return res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });        
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const notification = await Notification.findOne({
          where: {id: req.params.id}
        });

        if(!notification){
          return res.status(NOT_FOUND).json({message: "Notification Not Found"});          
        } 
        await notification.update({
          profile_id: req.body.profile_id,
          message: req.body.message,
          is_read: req.body.is_read,
          // updated_by: req.user.id
        }, {transaction: t});

        return res.status(OK).json({Notification: notification});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});
      }
    })
  },
  delete: async (req, res) => {
    await sequelize.transaction( async (t) => {
      try{
        const notification = await Notification.findOne({
          where: {id: req.params.id}
        });

        if(!notification){
          return res.status(NOT_FOUND).json({message: "Notification Not Found"});          
        }
        
        await notification.destroy({
          // deleted_by: req.user.id
          force: false,
        }, {transaction: t});

        return res.status(OK).json({message: 'Notification Destroyed'});
        
      }catch(e){
        return res.status(INTERNAL_SERVER_ERROR).json({message: e.message});        
      }
    })
  }
};

module.exports.NotificationController = NotificationController;