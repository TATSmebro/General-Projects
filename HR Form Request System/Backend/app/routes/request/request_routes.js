const express = require('express')
const router = express.Router()

const { RequestController } = require('../../controllers/request/request_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/request/create:
 *    post:
 *      tags: 
 *        - Request
 *      description: Create Request API.
 *      summary: Create Request
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/RequestGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RequestsGetInformationResponse'
*/
router.post('/create', RequestController.create)

/**
 *  @openapi
 *  /api/v1/request/all:
 *    get:
 *      tags: 
 *        - Request
 *      description: GET All Requests API.
 *      summary: Get All Requests
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RequestsGetInformationResponse'
*/
router.get('/all', RequestController.all)
/**
 *  @openapi
 *  /api/v1/request/{id}:
 *    get:
 *      tags: 
 *        - Request
 *      description: GET Specific Request by Id API.
 *      summary: Get Specific Request
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
 *                $ref: '#/components/schemas/RequestGetInformationResponse'
 *      
*/
router.get('/:id', RequestController.get)

/**
 *  @openapi
 *  /api/v1/request/{id}:
 *    put:
 *      tags: 
 *        - Request
 *      description: Update Specific Request by Id API.
 *      summary: Update Specific Request
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
 *                      $ref: '#/components/schemas/RequestGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/RequestGetInformationResponse'
 *      
*/
router.put('/:id', RequestController.update)

/**
 *  @openapi
 *  /api/v1/request/{id}:
 *    delete:
 *      tags: 
 *        - Request
 *      description: Delete Specific Request by Id API.
 *      summary: Delete Specific Request
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
 *                $ref: '#/components/schemas/RequestGetInformationResponse'
 *      
*/
router.delete('/:id', RequestController.delete)

module.exports.RequestRoutes = router