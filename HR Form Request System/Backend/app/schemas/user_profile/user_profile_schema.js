/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfileGetInformation:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         last_name:
 *           type: string
 *         department_id:
 *           type: integer
 *         role_id:
 *           type: integer
 *         profile_photo:
 *           type: string
 *     UserProfileGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserProfileGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     UserProfilesGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/UserProfileGetInformationResponse'
 * 
 */
