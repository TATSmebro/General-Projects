const express = require('express')
const router = express.Router()

const { RoleController } = require('../../controllers/role/role_controller')

/**
 *  @openapi
 *  /api/v1/role/create:
 *    post:
 *      tags: 
 *        - Role
 *      description: Create Role API.
 *      summary: Create New Role
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/RoleGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RoleGetInformationResponse'
*/
router.post('/create', RoleController.create)

/**
 *  @openapi
 *  /api/v1/role/all:
 *    get:
 *      tags: 
 *        - Role
 *      description: GET All Roles API.
 *      summary: Get All Roles
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RolesGetInformationResponse'
*/
router.get('/all', RoleController.all)
/**
 *  @openapi
 *  /api/v1/role/{id}:
 *    get:
 *      tags: 
 *        - Role
 *      description: GET Specific Role by Id API.
 *      summary: Get Specific Role
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
 *                $ref: '#/components/schemas/RoleGetInformationResponse'
 *      
*/
router.get('/:id', RoleController.get)
/**
 *  @openapi
 *  /api/v1/role/{id}:
 *    put:
 *      tags: 
 *        - Role
 *      description: Update Specific Role by Id API.
 *      summary: Update Specific Role
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
 *                      $ref: '#/components/schemas/RoleGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RoleGetInformationResponse'
 *      
*/
router.put('/:id', RoleController.update)
/**
 *  @openapi
 *  /api/v1/role/{id}:
 *    delete:
 *      tags: 
 *        - Role
 *      description: Delete Specific Role by Id API.
 *      summary: Delete Specific Role
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
 *                $ref: '#/components/schemas/RoleGetInformationResponse'
 *      
*/
router.delete('/:id', RoleController.delete)


module.exports.RoleRoutes = router