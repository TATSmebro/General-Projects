/**
 * @openapi
 * components:
 *   schemas:
 *     BookingDetailsGetInformation:
 *       type: object
 *       properties:
 *         departure_ref_no:
 *           type: string
 *         departure_cost:
 *           type: number
 *         departure_ticket_path:
 *           type: string
 *         return_ref_no:
 *           type: string
 *         return_cost:
 *           type: number
 *         return_ticket_path:
 *           type: string
 *     BookingDetailsGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/BookingDetailsGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     AllBookingDetailsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/BookingDetailsGetInformationResponse'
 * 
 */
