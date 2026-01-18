/**
 * @openapi
 * components:
 *   schemas:
 *     DepartmentGetInformation:
 *       type: object
 *       properties:
 *         department_name:
 *           type: string
 *     DepartmentGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/DepartmentGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     DepartmentsGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/DepartmentGetInformationResponse'
 * 
 */
