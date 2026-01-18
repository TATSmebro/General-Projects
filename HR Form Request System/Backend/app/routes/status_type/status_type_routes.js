const express = require('express');
const router = express.Router();

const { StatusTypeController } = require('../../controllers/status_type/status_type_controller');

/**
 *  @openapi
 *  /api/v1/status_type/all:
 *    get:
 *      tags: 
 *        - StatusType
 *      description: GET All StatusTypes API.
 *      summary: Get All StatusTypes
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StatusTypesGetInformationResponse'
 */
router.get('/all', StatusTypeController.all);

/**
 *  @openapi
 *  /api/v1/status_type/{id}:
 *    get:
 *      tags: 
 *        - StatusType
 *      description: GET Specific StatusType by Id API.
 *      summary: Get Specific StatusType
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
 *                $ref: '#/components/schemas/StatusTypeGetInformationResponse'
 */
router.get('/:id', StatusTypeController.get);

/**
 *  @openapi
 *  /api/v1/status_type/create:
 *    post:
 *      tags:
 *        - StatusType
 *      description: Create a new StatusType
 *      summary: Create StatusType
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/StatusTypeCreateInput'
 *      responses:
 *        201:
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StatusTypeGetInformationResponse'
 */
router.post('/create', StatusTypeController.create);

/**
 *  @openapi
 *  /api/v1/status_type/{id}:
 *    put:
 *      tags:
 *        - StatusType
 *      description: Update an existing StatusType
 *      summary: Update StatusType
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
 *              $ref: '#/components/schemas/StatusTypeUpdateInput'
 *      responses:
 *        200:
 *          description: Updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StatusTypeGetInformationResponse'
 */
router.put('/:id', StatusTypeController.update);

/**
 *  @openapi
 *  /api/v1/status_type/{id}:
 *    delete:
 *      tags:
 *        - StatusType
 *      description: Soft delete a StatusType
 *      summary: Delete StatusType
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
 *              type: object
 *              properties:
 *                deleted_by:
 *                  type: integer
 *      responses:
 *        200:
 *          description: Deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 */
router.delete('/:id', StatusTypeController.delete);

module.exports.StatusTypeRoutes = router;
