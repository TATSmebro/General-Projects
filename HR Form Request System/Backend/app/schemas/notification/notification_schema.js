/**
 * @openapi
 * components:
 *   schemas:
 *     NotificationGetInformation:
 *       type: object
 *       properties:
 *         profile_id:
 *           type: integer
 *         message:
 *           type: string
 *         is_read:
 *           type: boolean
 *     NotificationGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/NotificationGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     NotificationsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/NotificationGetInformationResponse'
 * 
 */
