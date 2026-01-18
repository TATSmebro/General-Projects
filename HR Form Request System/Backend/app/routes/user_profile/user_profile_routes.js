const express = require('express')
const router = express.Router()

const { UserProfileController } = require('../../controllers/user_profile/user_profile_controller')

/**
 *  @openapi
 *  /api/v1/user_profile/create:
 *    post:
 *      tags: 
 *        - User Profile
 *      description: Create User Profile API.
 *      summary: Create New User Profile
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UserProfileGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserProfileGetInformationResponse'
*/
router.post('/create', UserProfileController.create)
/**
 *  @openapi
 *  /api/v1/user_profile/all:
 *    get:
 *      tags: 
 *        - User Profile
 *      description: GET All User Profiles API.
 *      summary: Get All User Profiles
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserProfilesGetInformationResponse'
*/
router.get('/all', UserProfileController.all)
/**
 *  @openapi
 *  /api/v1/user_profile/{id}:
 *    get:
 *      tags: 
 *        - User Profile
 *      description: GET Specific User Profile by Id API.
 *      summary: Get Specific User Profile
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
 *                $ref: '#/components/schemas/UserProfileGetInformationResponse'
 *      
*/
router.get('/:id', UserProfileController.get)
/**
 *  @openapi
 *  /api/v1/user_profile/{id}:
 *    put:
 *      tags: 
 *        - User Profile
 *      description: Update Specific User Profile by Id API.
 *      summary: Update Specific User Profile
 *      security: 
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *           type: integer
 *          required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UserProfileGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserProfileGetInformationResponse'
 *      
*/
router.put('/:id', UserProfileController.update)
/**
 *  @openapi
 *  /api/v1/user_profile/{id}:
 *    delete:
 *      tags: 
 *        - User Profile
 *      description: Delete Specific User Profile by Id API.
 *      summary: Delete Specific User Profile
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
 *                $ref: '#/components/schemas/UserProfileGetInformationResponse'
 *      
*/
router.delete('/:id', UserProfileController.delete)

module.exports.UserProfileRoutes = router