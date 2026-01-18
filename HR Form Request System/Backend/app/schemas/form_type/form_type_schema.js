/**
 * @openapi
 * components:
 *   schemas:
 *     FormTypeGetInformation:
 *       type: object
 *       properties:
 *         form_name:
 *           type: string
 *     FormTypeGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/FormTypeGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     FormTypesGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/FormTypeGetInformationResponse'
 */

