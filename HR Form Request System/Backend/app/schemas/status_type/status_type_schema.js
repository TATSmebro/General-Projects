/**
 * @openapi
 * components:
 *   schemas:
 *     StatusTypeGetInformation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status_name:
 *           type: string
 *     StatusTypeGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/StatusTypeGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     StatusTypesGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/StatusTypeGetInformationResponse'
 *
 *     StatusTypeCreateInput:
 *       type: object
 *       required:
 *         - status_name
 *         - created_by
 *       properties:
 *         status_name:
 *           type: string
 *         created_by:
 *           type: integer
 *
 *     StatusTypeUpdateInput:
 *       type: object
 *       required:
 *         - status_name
 *         - updated_by
 *       properties:
 *         status_name:
 *           type: string
 *         updated_by:
 *           type: integer
 */
