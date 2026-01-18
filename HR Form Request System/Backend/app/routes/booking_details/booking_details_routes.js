const express = require('express')
const router = express.Router()

const { BookingDetailsController } = require('../../controllers/booking_details/booking_details_controller')

/**
 *  @openapi
 *  /api/v1/booking_details/create:
 *    post:
 *      tags: 
 *        - Booking Details
 *      description: Create Booking Details API.
 *      summary: Create New Booking Details
 *      security: 
 *        - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/BookingDetailsGetInformation'
 *      responses:
 *        201:
 *          description: CREATED
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BookingDetailsGetInformationResponse'
*/
router.post('/create', BookingDetailsController.create)
/**
 *  @openapi
 *  /api/v1/booking_details/all:
 *    get:
 *      tags: 
 *        - Booking Details
 *      description: GET All Booking Details API.
 *      summary: Get All Booking Details
 *      security: 
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/AllBookingDetailsGetInformationResponse'
*/
router.get('/all', BookingDetailsController.all)
/**
 *  @openapi
 *  /api/v1/booking_details/{id}:
 *    get:
 *      tags: 
 *        - Booking Details
 *      description: GET Specific Booking Details by Id API.
 *      summary: Get Specific Booking Details
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
 *                $ref: '#/components/schemas/BookingDetailsGetInformationResponse'
 *      
*/
router.get('/:id', BookingDetailsController.get)
/**
 *  @openapi
 *  /api/v1/booking_details/{id}:
 *    put:
 *      tags: 
 *        - Booking Details
 *      description: Update Specific Booking Details by Id API.
 *      summary: Update Specific Booking Details
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
 *                      $ref: '#/components/schemas/BookingDetailsGetInformation'
 *      responses:
 *        200:
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BookingDetailsGetInformationResponse'
 *      
*/
router.put('/:id', BookingDetailsController.update)
/**
 *  @openapi
 *  /api/v1/booking_details/{id}:
 *    delete:
 *      tags: 
 *        - Booking Details
 *      description: Delete Specific Booking Details by Id API.
 *      summary: Delete Specific Booking Details
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
 *                $ref: '#/components/schemas/BookingDetailsGetInformationResponse'
 *      
*/
router.delete('/:id', BookingDetailsController.delete)

module.exports.BookingDetailsRoutes = router