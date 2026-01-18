const express = require('express')
const router = express.Router()

const { FlierController } = require('../../controllers/flier/flier_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/flier/create:
 *    post:
 *      tags: 
 *        - Flier
 *      description: Create Flier API.
 *      summary: Create Flier
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/FlierGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FliersGetInformationResponse'
*/
router.post('/create', FlierController.create)

/**
 *  @openapi
 *  /api/v1/flier/all:
 *    get:
 *      tags: 
 *        - Flier
 *      description: GET All Flier API.
 *      summary: Get All Flier
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FliersGetInformationResponse'
*/
router.get('/all', FlierController.all)
/**
 *  @openapi
 *  /api/v1/flier/{id}:
 *    get:
 *      tags: 
 *        - Flier
 *      description: GET Specific Flier by Id API.
 *      summary: Get Specific Flier
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
 *                $ref: '#/components/schemas/FlierGetInformationResponse'
 *      
*/
router.get('/:id', FlierController.get)

/**
 *  @openapi
 *  /api/v1/flier/{id}:
 *    put:
 *      tags: 
 *        - Flier
 *      description: Update Specific Flier by Id API.
 *      summary: Update Specific Flier
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
 *                      $ref: '#/components/schemas/FlierGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FlierGetInformationResponse'
 *      
*/
router.put('/:id', FlierController.update)

/**
 *  @openapi
 *  /api/v1/flier/{id}:
 *    delete:
 *      tags: 
 *        - Flier
 *      description: Delete Specific Flier by Id API.
 *      summary: Delete Specific Flier
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
 *                $ref: '#/components/schemas/FlierGetInformationResponse'
 *      
*/
router.delete('/:id', FlierController.delete)

module.exports.FlierRoutes = router