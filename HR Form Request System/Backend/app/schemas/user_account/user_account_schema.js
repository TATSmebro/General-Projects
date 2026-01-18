/**
 * @openapi
 * components:
 *   schemas:
 *     Login:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           default: 'username'
 *         password:
 *           type: string
 *           default: 'password'
 *     UserAccount:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role_id
 *         - first_name
 *         - last_name
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           example: 'username'
 *         password:
 *           type: string
 *           example: 'password'
 *         email:
 *           type: string
 *           example: 'email@tfi.com'
 *         contact_number:
 *           type: string
 *           example: '09123456789'
 *         role_id:
 *           type: integer
 *           example: 1
 *         first_name:
 *           type: string
 *           example: 'sample first name'
 *         last_name:
 *           type: string
 *           example: 'sample last name'
 *         middle_name:
 *           type: string
 *           example: 'sample middle name'
 *         profile_image:
 *           type: string
 *           default: 'sample'
 *     UserAccountResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserAccount'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     UserAccountsResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/UserAccountResponse'
 *     profileImageResponse:
 *       type: object
 *       required:
 *         - profile_image 
 *       properties:
 *         profile_image:
 *           type: string
 *           format: binary
 *           default: 'sample'
 *     UserAccounts:
 *       type: object
 *       required:
 *         - role_id
 *       properties:
 *         id:
 *           type: integer
 *           default: 0
 *         role_id:
 *           type: integer
 *           example: 1
 *         profile_image:
 *           type: string
 *           default: 'sample'
 *     UserAccountResponses:
 *       allOf:
 *         - $ref: '#/components/schemas/UserAccounts'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     UserAccountGetInformation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         role_id:
 *           type: integer
 *         profile_image:
 *           type: string
 *     UserAccountGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserAccountGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     UserAccountsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/UserAccountGetInformationResponse'
 *  
 *     vUserAccount:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role_id
 *         - first_name
 *         - last_name
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: 'email@tfi.com'
 *         contact_number:
 *           type: string
 *           example: '09123456789'
 *         role_id:
 *           type: integer
 *           example: 1
 *         first_name:
 *           type: string
 *           example: 'sample first name'
 *         last_name:
 *           type: string
 *           example: 'sample last name'
 *         middle_name:
 *           type: string
 *           example: 'sample middle name'
 *         profile_image:
 *           type: string
 *           default: 'sample'
 *     vUserAccountResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/vUserAccount'
 *         - $ref: '#/components/schemas/TimeStamps'
 */
