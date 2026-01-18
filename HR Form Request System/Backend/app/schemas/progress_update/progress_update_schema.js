/**
 * @openapi
 * components:
 *   schemas:
 *     ProgressUpdateGetInformation:
 *       type: object
 *       properties:
 *         request_id:
 *           type: integer
 *         status_id:
 *           type: integer
 *     ProgressUpdateGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ProgressUpdateGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     ProgressUpdatesGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/ProgressUpdateGetInformationResponse'
 * 
 */
