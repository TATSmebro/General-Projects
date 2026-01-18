const express = require('express')
const router = express.Router()

const { UserAccountController } = require('../../controllers/user_account/user_account_controller')
const verify_user_account = require('../../middlewares/auth/verify_user_account')
const { upload_service } = require('../../services/upload_service/upload_service')

router.post('/initialize', UserAccountController.initialize)

/**
 *  @openapi
 *  /api/v1/user/login:
 *    post:
 *      tags: 
 *        - Auth
 *      description: LOGIN authentication API for UserAccount.
 *      summary: LOGIN Authentication for UserAccount
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login'
*/
router.post('/login', UserAccountController.login)
/**
 *  @openapi
 *  /api/v1/user/register:
 *    post:
 *      tags: 
 *        - User Account
 *      description: CREATE New UserAccount API.
 *      summary: Create New UserAccount
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/vUserAccountResponse'
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserAccount'
*/
router.post('/register', verify_user_account, UserAccountController.create)
/**
 *  @openapi
 *  /api/v1/user/all:
 *    get:
 *      tags: 
 *        - User Account
 *      description: GET All UserAccounts API.
 *      summary: Get All UserAccounts
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserAccountsGetInformationResponse'
*/
router.get('/all', verify_user_account, UserAccountController.all)
/**
 *  @openapi
 *  /api/v1/user/{id}:
 *    get:
 *      tags: 
 *        - User Account
 *      description: GET Specific UserAccount by Id API.
 *      summary: Get Specific UserAccount
 *      security: 
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *           type: integer
 *          required: true
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserAccountGetInformationResponse'
 *      
*/
router.get('/:id', verify_user_account, UserAccountController.get)
/**
 *  @openapi
 *  /api/v1/user/{id}:
 *    put:
 *      tags: 
 *        - User Account
 *      description: UPDATE UserAccount by ID Api.
 *      summary: Update Specific UserAccount
 *      security: 
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *           type: integer
 *          required: true
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserAccountResponse'
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserAccount'
*/
router.put('/:id', verify_user_account, UserAccountController.update)
/**
 *  @openapi
 *  /api/v1/user/{id}:
 *    delete:
 *      tags: 
 *        - User Account
 *      description: DELETE UserAccount by Id API.
 *      summary: Delete Specific UserAccount
 *      security: 
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *           type: integer
 *          required: true
 *      responses:
 *        200:
 *          description: Ok
 *      
*/
router.delete('/:id', verify_user_account, UserAccountController.delete)
/**
 *  @openapi
 *  /api/v1/user/password/reset:
 *    put:
 *      tags: 
 *        - User Account
 *      description: UPDATE Password of UserAccount API.
 *      summary: Update UserAccount Password
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                current_password:
 *                  type: string
 *                  default: 'currentPassword'
 *                new_password:
 *                  type: string
 *                  default: 'newPassword'
 *                confirm_password:
 *                  type: string
 *                  default: 'newPassword'
*/
router.put('/password/reset', verify_user_account, UserAccountController.updatePassword)
/**
 * @openapi
 * /api/v1/user/{id}/uploadpicture:
 *   put:
 *     summary: Update user account profile picture by ID.
 *     description: Update user account profile picture by ID.
 *     tags:
 *       - User Account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: User account ID.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/profileImageResponse'
 *     responses:
 *       200:
 *         description: User account profile picture updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAccountResponses'
 */
router.put('/:id/uploadpicture', verify_user_account, upload_service.single('profile_image'), UserAccountController.uploadProfilePic);

module.exports.UserAccountRoutes = router