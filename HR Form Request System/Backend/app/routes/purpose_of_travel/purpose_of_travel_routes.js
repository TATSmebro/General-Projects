const express = require('express')
const router = express.Router()

const { PurposeOfTravelController } = require('../../controllers/purpose_of_travel/purpose_of_travel_controller');

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/purpose_of_travel/create:
 *    post:
 *      tags: 
 *        - PurposeOfTravel
 *      description: Create Purpose API.
 *      summary: Create Purposes
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/PurposeOfTravelGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PurposeOfTravelsGetInformationResponse'
*/
router.post('/create', PurposeOfTravelController.create)

/**
 *  @openapi
 *  /api/v1/purpose_of_travel/all:
 *    get:
 *      tags: 
 *        - PurposeOfTravel
 *      description: GET All Purpose API.
 *      summary: Get All Purposes
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PurposeOfTravelsGetInformationResponse'
*/
router.get('/all', PurposeOfTravelController.all)
/**
 *  @openapi
 *  /api/v1/purpose_of_travel/{id}:
 *    get:
 *      tags: 
 *        - PurposeOfTravel
 *      description: GET Specific Purpose by Id API.
 *      summary: Get Specific Purpose
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
 *                $ref: '#/components/schemas/PurposeOfTravelGetInformationResponse'
 *      
*/
router.get('/:id', PurposeOfTravelController.get)

/**
 *  @openapi
 *  /api/v1/purpose_of_travel/{id}:
 *    put:
 *      tags: 
 *        - PurposeOfTravel
 *      description: Update Specific Purpose by Id API.
 *      summary: Update Specific Purpose
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
 *                      $ref: '#/components/schemas/PurposeOfTravelGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PurposeOfTravelGetInformationResponse'
 *      
*/
router.put('/:id', PurposeOfTravelController.update)

/**
 *  @openapi
 *  /api/v1/purpose_of_travel/{id}:
 *    delete:
 *      tags: 
 *        - PurposeOfTravel
 *      description: Delete Specific Purpose by Id API.
 *      summary: Delete Specific Purpose
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
 *                $ref: '#/components/schemas/PurposeOfTravelGetInformationResponse'
 *      
*/
router.delete('/:id', PurposeOfTravelController.delete)

module.exports.PurposeOfTravelRoutes = router