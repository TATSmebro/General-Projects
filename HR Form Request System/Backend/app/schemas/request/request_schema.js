/**
 * @openapi
 * components:
 *   schemas:
 *     RequestGetInformation:
 *       type: object
 *       properties:
 *         form_request_id:
 *           type: integer
 *         form_id:
 *           type: integer
 *         status_id:
 *           type: integer
 *     RequestGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/RequestGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     RequestsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/RequestGetInformationResponse'
 * 
 */
