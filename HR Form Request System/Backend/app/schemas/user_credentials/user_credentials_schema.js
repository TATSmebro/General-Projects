/**
 * @openapi
 * components:
 *   schemas:
 *     UserCredentialsGetInformation:
 *       type: object
 *       properties:
 *         profile_id:
 *           type: integer
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *     UserCredentialsGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserCredentialsGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     AllUserCredentialsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/UserCredentialsGetInformationResponse'
 * 
 */
