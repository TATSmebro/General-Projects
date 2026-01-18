const express = require('express')
const router = express.Router()

const { ProgressUpdateController } = require('../../controllers/progress_update/progress_update_controller')

/**
 *  @openapi
 *  /api/v1/progress_update/create:
 *    post:
 *      tags: 
 *        - Progress Update
 *      description: Create Progress Update API.
 *      summary: Create New Progress Update
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ProgressUpdateGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ProgressUpdateGetInformationResponse'
*/
router.post('/create', ProgressUpdateController.create)
/**
 *  @openapi
 *  /api/v1/progress_update/all:
 *    get:
 *      tags: 
 *        - Progress Update
 *      description: GET All Progress Update API.
 *      summary: Get All Progress Update
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ProgressUpdatesGetInformationResponse'
*/
router.get('/all', ProgressUpdateController.all)
/**
 *  @openapi
 *  /api/v1/progress_update/{id}:
 *    get:
 *      tags: 
 *        - Progress Update
 *      description: GET Specific Progress Update by Id API.
 *      summary: Get Specific Progress Update
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
 *                $ref: '#/components/schemas/ProgressUpdateGetInformationResponse'
 *      
*/
router.get('/:id', ProgressUpdateController.get)
/**
 *  @openapi
 *  /api/v1/progress_update/{id}:
 *    put:
 *      tags: 
 *        - Progress Update
 *      description: Update Progress Update Role by Id API.
 *      summary: Update Progress Update Role
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
 *                      $ref: '#/components/schemas/ProgressUpdateGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ProgressUpdateGetInformationResponse'
 *      
*/
router.put('/:id', ProgressUpdateController.update)
/**
 *  @openapi
 *  /api/v1/progress_update/{id}:
 *    delete:
 *      tags: 
 *        - Progress Update
 *      description: Delete Specific Progress Update by Id API.
 *      summary: Delete Specific Progress Update
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
 *                $ref: '#/components/schemas/ProgressUpdateGetInformationResponse'
 *      
*/
router.delete('/:id', ProgressUpdateController.delete)

module.exports.ProgressUpdateRoutes = router