const express = require('express')
const router = express.Router()

const { FlightRequestController } = require('../../controllers/flight_request/flight_request_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/flight_request/create:
 *    post:
 *      tags: 
 *        - Flight Request
 *      description: Create Flight Request API.
 *      summary: Create Flight Request
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/FlightRequestGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FlightRequestsGetInformationResponse'
*/
router.post('/create', FlightRequestController.create)

/**
 *  @openapi
 *  /api/v1/flight_request/all:
 *    get:
 *      tags: 
 *        - Flight Request
 *      description: GET All Flight Requests API.
 *      summary: Get All Flight Requests
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FlightRequestsGetInformationResponse'
*/
router.get('/all', FlightRequestController.all)
/**
 *  @openapi
 *  /api/v1/flight_request/{id}:
 *    get:
 *      tags: 
 *        - Flight Request
 *      description: GET Specific Flight Request by Id API.
 *      summary: Get Specific Flight Request
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
 *                $ref: '#/components/schemas/FlightRequestsGetInformationResponse'
 *      
*/
router.get('/:id', FlightRequestController.get)

/**
 *  @openapi
 *  /api/v1/flight_request/{id}:
 *    put:
 *      tags: 
 *        - Flight Request
 *      description: Update Specific Flight Request by Id API.
 *      summary: Update Specific Flight Request
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
 *                      $ref: '#/components/schemas/FlightRequestGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FlightRequestGetInformationResponse'
 *      
*/
router.put('/:id', FlightRequestController.update)

/**
 *  @openapi
 *  /api/v1/flight_request/{id}:
 *    delete:
 *      tags: 
 *        - Flight Request
 *      description: Delete Specific Flight Request by Id API.
 *      summary: Delete Specific Flight Request
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
 *                $ref: '#/components/schemas/FlightRequestGetInformationResponse'
 *      
*/
router.delete('/:id', FlightRequestController.delete)

module.exports.FlightRequestRoutes = router