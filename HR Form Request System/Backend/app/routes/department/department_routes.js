const express = require('express')
const router = express.Router()

const { DepartmentController } = require('../../controllers/department/department_controller')

/**
 *  @openapi
 *  /api/v1/department/create:
 *    post:
 *      tags: 
 *        - Department
 *      description: Create Department API.
 *      summary: Create New Department
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/DepartmentGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DepartmentGetInformationResponse'
*/
router.post('/create', DepartmentController.create)
/**
 *  @openapi
 *  /api/v1/department/all:
 *    get:
 *      tags: 
 *        - Department
 *      description: GET All Departments API.
 *      summary: Get All Departments
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DepartmentsGetInformationResponse'
*/
router.get('/all', DepartmentController.all)
/**
 *  @openapi
 *  /api/v1/department/{id}:
 *    get:
 *      tags: 
 *        - Department
 *      description: GET Specific Department by Id API.
 *      summary: Get Specific Department
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
 *                $ref: '#/components/schemas/DepartmentGetInformationResponse'
 *      
*/
router.get('/:id', DepartmentController.get)
/**
 *  @openapi
 *  /api/v1/department/{id}:
 *    put:
 *      tags: 
 *        - Department
 *      description: Update Department Role by Id API.
 *      summary: Update Department Role
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
 *                      $ref: '#/components/schemas/DepartmentGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/DepartmentGetInformationResponse'
 *      
*/
router.put('/:id', DepartmentController.update)
/**
 *  @openapi
 *  /api/v1/department/{id}:
 *    delete:
 *      tags: 
 *        - Department
 *      description: Delete Specific Department by Id API.
 *      summary: Delete Specific Department
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
 *                $ref: '#/components/schemas/DepartmentGetInformationResponse'
 *      
*/
router.delete('/:id', DepartmentController.delete)

module.exports.DepartmentRoutes = router