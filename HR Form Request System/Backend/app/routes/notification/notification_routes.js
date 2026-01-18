const express = require('express')
const router = express.Router()

const { NotificationController } = require('../../controllers/notification/notification_controller')

// TODO: Update schema ref

/**
 *  @openapi
 *  /api/v1/notification/create:
 *    post:
 *      tags: 
 *        - Notification
 *      description: Create Notification API.
 *      summary: Create Notification
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/NotificationGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NotificationsGetInformationResponse'
*/
router.post('/create', NotificationController.create)

/**
 *  @openapi
 *  /api/v1/notification/all:
 *    get:
 *      tags: 
 *        - Notification
 *      description: GET All Notifications API.
 *      summary: Get All Notifications
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NotificationsGetInformationResponse'
*/
router.get('/all', NotificationController.all)
/**
 *  @openapi
 *  /api/v1/notification/{id}:
 *    get:
 *      tags: 
 *        - Notification
 *      description: GET Specific Notification by Id API.
 *      summary: Get Specific Notification
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
 *                $ref: '#/components/schemas/NotificationGetInformationResponse'
 *      
*/
router.get('/:id', NotificationController.get)

/**
 *  @openapi
 *  /api/v1/notification/{id}:
 *    put:
 *      tags: 
 *        - Notification
 *      description: Update Specific Notification by Id API.
 *      summary: Update Specific Notification
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
 *                      $ref: '#/components/schemas/NotificationGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NotificationGetInformationResponse'
 *      
*/
router.put('/:id', NotificationController.update)

/**
 *  @openapi
 *  /api/v1/notification/{id}:
 *    delete:
 *      tags: 
 *        - Notification
 *      description: Delete Specific Notification by Id API.
 *      summary: Delete Specific Notification
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
 *                $ref: '#/components/schemas/NotificationGetInformationResponse'
 *      
*/
router.delete('/:id', NotificationController.delete)

module.exports.NotificationRoutes = router