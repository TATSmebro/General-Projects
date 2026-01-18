const express = require('express')
const router = express.Router()

const { UserCredentialsController } = require('../../controllers/user_credentials/user_credentials_controller')

/**
 *  @openapi
 *  /api/v1/user_credentials/create:
 *    post:
 *      tags: 
 *        - User Credentials
 *      description: Create User Credentials API.
 *      summary: Create New User Credentials
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/UserCredentialsGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserCredentialsGetInformationResponse'
*/
router.post('/create', UserCredentialsController.create)
/**
 *  @openapi
 *  /api/v1/user_credentials/all:
 *    get:
 *      tags: 
 *        - User Credentials
 *      description: GET All UserCredentials API.
 *      summary: Get All UserCredentials
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/AllUserCredentialsGetInformationResponse'
*/
router.get('/all', UserCredentialsController.all)
/**
 *  @openapi
 *  /api/v1/user_credentials/{id}:
 *    get:
 *      tags: 
 *        - User Credentials
 *      description: GET Specific User Credentials by Id API.
 *      summary: Get Specific User Credentials
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
 *                $ref: '#/components/schemas/UserCredentialsGetInformationResponse'
 *      
*/
router.get('/:id', UserCredentialsController.get)
/**
 *  @openapi
 *  /api/v1/user_credentials/{id}:
 *    put:
 *      tags: 
 *        - User Credentials
 *      description: Update Specific User Credentials by Id API.
 *      summary: Update Specific User Credentials
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
 *                      $ref: '#/components/schemas/UserCredentialsGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserCredentialsGetInformationResponse'
 *      
*/
router.put('/:id', UserCredentialsController.update)
/**
 *  @openapi
 *  /api/v1/user_credentials/{id}:
 *    delete:
 *      tags: 
 *        - User Credentials
 *      description: Delete Specific User Credentials by Id API.
 *      summary: Delete Specific User Credentials
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
 *                $ref: '#/components/schemas/UserCredentialsGetInformationResponse'
 *      
*/
router.delete('/:id', UserCredentialsController.delete)

module.exports.UserCredentialsRoutes = router