const express = require('express')
const router = express.Router()

const { ApproverController } = require('../../controllers/approver/approver_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/approver/create:
 *    post:
 *      tags: 
 *        - Approver
 *      description: Create Approver API.
 *      summary: Create Approver
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ApproverGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApproversGetInformationResponse'
*/
router.post('/create', ApproverController.create)

/**
 * 
 *  @openapi
 *  /api/v1/approver/all:
 *    get:
 *      tags: 
 *        - Approver
 *      description: GET All Approver API.
 *      summary: Get All Approvers
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApproversGetInformationResponse'
*/
router.get('/all', ApproverController.all)
/**
 *  @openapi
 *  /api/v1/approver/{id}:
 *    get:
 *      tags: 
 *        - Approver
 *      description: GET Specific Approver by Id API.
 *      summary: Get Specific Approver
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
 *                $ref: '#/components/schemas/ApproversGetInformationResponse'
 *      
*/
router.get('/:id', ApproverController.get)

/**
 *  @openapi
 *  /api/v1/approver/{id}:
 *    put:
 *      tags: 
 *        - Approver
 *      description: Update Specific Approver by Id API.
 *      summary: Update Specific Approver
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
 *                      $ref: '#/components/schemas/ApproverGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApproverGetInformationResponse'
 *      
*/
router.put('/:id', ApproverController.update)

/**
 *  @openapi
 *  /api/v1/approver/{id}:
 *    delete:
 *      tags: 
 *        - Approver
 *      description: Delete Specific Approver by Id API.
 *      summary: Delete Specific Approver
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
 *                $ref: '#/components/schemas/ApproverGetInformationResponse'
 *      
*/
router.delete('/:id', ApproverController.delete)

module.exports.ApproverRoutes = router