/**
 * @openapi
 * components:
 *   schemas:
 *     ApproverGetInformation:
 *       type: object
 *       properties:
 *         approver_name:
 *           type: string
 *     ApproverGetInformationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApproverGetInformation'
 *         - $ref: '#/components/schemas/TimeStamps'
 *     ApproversGetInformationResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/ApproverGetInformationResponse'
 * 
 */
