/**
 * @openapi
 * components:
 *   schemas:
 *     RoleGetInformation:
 *       type: object
 *       properties:
 *         role_name:
 *           type: string
 *     RoleGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/RoleGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     RolesGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/RoleGetInformationResponse'
 * 
 */
