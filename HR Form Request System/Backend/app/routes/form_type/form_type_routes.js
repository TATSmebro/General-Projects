const express = require('express')
const router = express.Router()

const { FormTypeController } = require('../../controllers/form_type/form_type_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/form_type/all:
 *    get:
 *      tags: 
 *        - FormType
 *      description: GET All FormTypes API.
 *      summary: Get All FormTypes
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FormTypesGetInformationResponse'
*/
router.get('/all', FormTypeController.all)
/**
 *  @openapi
 *  /api/v1/form_type/{id}:
 *    get:
 *      tags: 
 *        - FormType
 *      description: GET Specific FormType by Id API.
 *      summary: Get Specific FormType
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
 *                $ref: '#/components/schemas/FormTypeGetInformationResponse'
 *      
*/
router.get('/:id', FormTypeController.get)

/** 
 *  @openapi
 *  /api/v1/form_type/create:
 *      post:
 *          tags:
 *              - FormType
 *          description: Create a new FormType
 *          summary: Create FormType
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/FormTypeGetInformation'   
 *          responses:
 *              201:
 *                  description: Created
 *                  content: 
 *                      application/json:
 *                          schema:
 *                              #ref: '#/components/schema/FormTypeGetInformationResponses'
 */             
router.post('/create', FormTypeController.create)

/**
 *  @openapi
 *  /api/v1/form_type/{id}:
 *    put:
 *      tags:
 *        - FormType
 *      description: Update an existing FormType
 *      summary: Update FormType
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: integer
 *          required: true
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FormTypeGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FormTypeGetInformationResponse'
 */
router.put('/:id', FormTypeController.update);

/**
 *  @openapi
 *  /api/v1/form_type/{id}:
 *    delete:
 *      tags:
 *        - FormType
 *      description: Delete Specific FormType by Id API
 *      summary: Delete FormType
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: integer
 *          required: true
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FormTypeGetInformationResponse'
 */
router.delete('/:id', FormTypeController.delete);

module.exports.FormTypeRoutes = router