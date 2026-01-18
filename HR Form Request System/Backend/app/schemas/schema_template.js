/**
 * @openapi
 * components:
 *   schemas:
 *     {ModelName}:
 *       type: object
 *       required:
 *         - string_prop
 *         - int_prop
 *         - binary_prop
 *         - date_prop
 *         - time_prop
 *       properties:
 *         string_prop:
 *           type: string
 *         int_prop:
 *           type: integer
 *         binary_prop:
 *           type: string
 *           format: binary
 *           default: '1'
 *         date_prop:
 *           type: string
 *           format: date-time
 *           example: 'YYYY-MM-DD'
 *         time_prop:
 *           type: string
 *           format: date-time
 *           example: 'HH:MM:SS'
 *     {ModelName}Response:
 *       allOf:
 *         - $ref: '#/components/schemas/{ModelName}'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     {ModelName}sResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/{ModelName}Response'
 *             
 */