/**
 * @openapi
 * components:
 *   schemas:
 *     PurposeOfTravelGetInformation:
 *       type: object
 *       properties:
 *         purpose_name:
 *           type: string
 *     PurposeOfTravelGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/PurposeOfTravelGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     PurposeOfTravelsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/PurposeOfTravelGetInformationResponse'
 * 
 */
