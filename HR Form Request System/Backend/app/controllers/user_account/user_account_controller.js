const { Op } = require("sequelize");


const { UserAccount, Teacher, Admin, sequelize } = require("../../models/");

const fs = require('fs');
const {
  createUserAccountFormValidator,
  updatePasswordFormValidator,
} = require("./user_account_validator");
const { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, PRECONDITION_FAILED } = require('../../constants/http/status_codes');


const UserAccountController = {
  initialize: async (req, res) => {
    const newUser = await sequelize.transaction(async (t) => {
      try {
        const superAdmin = await UserAccount.create(
          {
            username: req.body.username,
            password: req.body.password,
            role_id: 1,
          },
          { transaction: t }
        );

        return superAdmin;
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
   },
  login: async (req, res) => {
    try {
      const user = await UserAccount.findOne({
        where: {
          username: req.body.username,
        },
      });
      if (!user) {
        res.status(NOT_FOUND).json({ message: "Username does not exist" });
        return;
      }

      if (!user.validatePassword(req.body.password)) {
        res.status(NOT_FOUND).json({
          message: "Username or password does not match",
        });
        return;
      }
      const token = await user.generateToken(user.id);

      const loginUser = {
        id: user.id,
        role_id: user.role_id,
        profile_image: user.profile_image,
        token: user.token,
        verified_at: user.verified_at,
        created_by: user.created_by,
        created_at: user.created_at,
        updated_by: user.updated_by,
        updated_at: user.updated_at,
        deleted_by: user.deleted_by,
        deleted_at: user.deleted_at
      }
      res.status(OK).json({ UserAccount: loginUser, token: token });
      return;
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      return;
    }
  },
  create: async (req, res) => {
    const matched = createUserAccountFormValidator(req.body, res).validate();

    if (!matched) {
      return;
    }

    await sequelize.transaction(async (t) => {
      try {

        switch (req.body.role_id) {
          case 1:
            res.status(OK).json({ message: "Test" });
            return;
          case 2:
            const admin = await Admin.create(
              {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                middle_name: req.body.middle_name,
                email: req.body.email,
                contact_number: req.body.contact_number,
                created_by: req.user.id,
                UserAccount: {
                  username: req.body.username,
                  password: req.body.password,
                  role_id: req.body.role_id,
                  created_by: req.user.id,
                },
              },
              {
                include: [UserAccount],
              },
              { transaction: t }
            );
            const uadmin = await Admin.findOne({
              where: {
                user_account_id: admin.UserAccount.id,
              },
            })

            res.status(OK).json({
              Admin: uadmin,
              Message: "Admin Credentials Successfully Created!",
            });
            return;
          case 3:
            const teacher = await Teacher.create(
              {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                middle_name: req.body.middle_name,
                email: req.body.email,
                contact_number: req.body.contact_number,
                created_by: req.user.id,
                UserAccount: {
                  username: req.body.username,
                  password: req.body.password,
                  role_id: req.body.role_id,
                  created_by: req.user.id,
                },
              },
              {
                include: [UserAccount],
              },
              { transaction: t }
            );
            const uteacher = await Teacher.findOne({
              where: {
                user_account_id: teacher.UserAccount.id,
              },
            })

            res.status(OK).json({
              Teacher: uteacher,
              Message: "Teacher Credentials Successfully Created!",
            });
            return;
        }
        return;
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
        return;
      }
    });
  },
  all: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const userAccounts = await UserAccount.findAll({
          attributes: ['id', 'role_id', 'profile_image', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
        });
        res.json(userAccounts);
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  get: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user = await UserAccount.findOne(
          {
            where: {
              id: req.params.id,
            },
            attributes: ['id', 'role_id', 'profile_image', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']

          },
        );

        if (!user) {
          res.status(NOT_FOUND).json({
            message: `No matching record with ${req.params.id}`,
          });
          return;
        }

        res.status(OK).json(user);
        return;
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
        return;
      }
    });
  },
  update: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user = await UserAccount.findOne(
          {
            where: {
              id: req.params.id,
            },
          },
        );

        if (!user) {
          res.status(NOT_FOUND).json({
            message: `No matching user with user id ${req.params.id}`,
          });
          return;
        }

        switch (user.role_id) {
          case 1:
            return user;
            break;
          case 2:
   
            const adminUser = await Admin.findOne({
              where: {
                user_account_id: user.id,
              },
            });

            await adminUser.update({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              middle_name: req.body.middle_name,
              email: req.body.email,
              contact_number: req.body.contact_number,
              updated_by: req.user.id,
            });

             res.status(OK).json({ Admin: adminUser, Message: 'Admin Credentials Successfully Updated!' });
            return;
          case 3:
        
            const teacherUser = await Teacher.findOne({
              where: {
                user_account_id: user.id,
              },
            });

            await teacherUser.update({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              middle_name: req.body.middle_name,
              email: req.body.email,
              contact_number: req.body.contact_number,
              updated_by: req.user.id,
            });


            res.status(OK).json({ Teacher: teacherUser, Message: 'Teacher Credential Successfully Updated!' });
            return;
        }
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  delete: async (req, res) => {
    await sequelize.transaction(async (t) => {
      try {
        const user = await UserAccount.findOne(
          {
            where: { id: req.params.id },
          },
        );

        if (!user) {
          res.status(NOT_FOUND).json({
            message: `No matching user with user id ${req.params.id}`,
          });

          return;
        }

        switch (user.role_id) {
          case 1:
            return user;
            break;
          case 2:
            await user.destroy({
              force: false,
              deleted_by: user.id,
            });

            const adminUser = await Admin.findOne({
              where: {
                user_account_id: user.id,
              },
            });

            await adminUser.destroy({
              force: false,
              deleted_by: req.user.id,
            });

          case 3:
            await user.destroy({
              force: false,
              deleted_by: req.user.id,
            });

            const teacherUser = await Teacher.findOne({
              where: {
                user_account_id: user.id,
              },
            });

            await teacherUser.destroy({
              force: false,
              deleted_by: req.user.id,
            });
        }

        res.status(OK).json({
          Message: `User Account Deleted Successfully!`,
        });
        return;
      } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
      }
    });
  },
  updatePassword: async (req, res) => {
    const matched = updatePasswordFormValidator(req.body, res).validate();

    if (!matched) return;

    const user = req.user;

    if (
      req.body.current_password !== user.password ||
      req.body.new_password !== req.body.confirm_password
    ) {
      res.status(PRECONDITION_FAILED).json({ message: "Password does not match" });
      return;
    }

    if (req.body.confirm_password === user.password) {
      res.status(PRECONDITION_FAILED).json({
        message: "New password must not match existing password",
      });
      return;
    }

    user.update({
      password: req.body.confirm_password,
    });

    res.status(OK).json({
      message: "Password has been updated successfully",
    });
    return;
  },

  uploadProfilePic: async (req, res) => {
    let file = req.file;
    if (!file || file.length === 0) {
      return res.status(NOT_FOUND).json({ message: 'No file uploaded' });
    }

    if (!file.path) {
      return res.status(PRECONDITION_FAILED).json({ message: 'Error uploading file' });
    }

    let filePath = file.path.split("storage")[1];

    try {
      const profilePic = await UserAccount.findOne({
        where: {
          id: req.params.id,
        },
        attributes: ['id', 'role_id', 'profile_image', 'created_by', 'created_at', 'updated_by', 'updated_at', 'deleted_by', 'deleted_at']
      });

      if (!profilePic) {
        await fs.promises.unlink(file.path);
        return res.status(NOT_FOUND).json({ message: `No matching record for user_account_id: ${req.params.id}` });
      }
      await sequelize.transaction(async (t) => {
        // Remove old profile image file if it exists and is different from new file
        if (profilePic.profile_image && profilePic.profile_image !== filePath) {
          try {
            await fs.promises.unlink(`./storage${profilePic.profile_image}`);
          } catch (error) {
            if (error.code === "ENOENT") {
              console.log(`File ${profilePic.profile_image} does not exist.`);
            } else {
              console.log(`Error deleting file ${profilePic.profile_image}: ${error.message}`);
            }
          }
        }
        await profilePic.update({
          profile_image: filePath,
          updated_by: req.user.id
        }, { transaction: t });

        res.status(OK).json(profilePic)
        return;
      });
    } catch (error) {
      if (filePath) {
        try {
          await fs.promises.unlink(file.path);
        } catch (error) {
          if (error.code === "ENOENT") {
            console.log(`File ${filePath} does not exist.`);
          } else {
            console.log(`Error deleting file ${filePath}: ${error.message}`);
          }
        }
      }
      res.status(INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  },

};

module.exports.UserAccountController = UserAccountController;
