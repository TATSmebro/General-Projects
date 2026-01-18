/**
 * @openapi
 * /api/v1/{model}/create:
 *   post:
 *     tags:
 *       - {Component Tag}
 *     description: CREATE {Component} API
 *     summary: Create model
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Component}Response'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/{Component}'
 *     parameters:
 *       - in: path
 *         name: model_id
 *         schema:
 *           type: integer
 *         required: true
 */
router.post('/', verify_user_account, Controller.developingRoute)
/**
 * @openapi
 * /api/v1/{model}/all:
 *   get:
 *     tags:
 *       - {Component Tag}
 *     description: GET All {Component} API
 *     summary: Get all
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Component}sResponse'
 *     parameters:
 *       - in: path
 *         name: model_id
 *         schema:
 *           type: integer
 *         required: true
 */
router.get('/', verify_user_account, Controller.developingRoute)
/**
 * @openapi
 * /api/v1/{model}/{model_id}:
 *   get:
 *     tags:
 *       - {Component Tag}
 *     description: GET {Component} by Id API
 *     summary: Get specific model
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Component}Response'
 *     parameters:
 *       - in: path
 *         name: model_id
 *         schema:
 *           type: integer
 *         required: true
 */
router.get('/', verify_user_account, Controller.developingRoute)
/**
 * @openapi
 * /api/v1/{model}/{model_id}:
 *   put:
 *     tags:
 *       - {Component Tag}
 *     description: UPDATE {Component} by Id API
 *     summary: Update specific model
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Component}Response'
 *     parameters:
 *       - in: path
 *         name: model_id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/{Component}'
 */
router.put('/', verify_user_account, Controller.developingRoute)
/**
 * @openapi
 * /api/v1/{model}/{model_id}:
 *   delete:
 *     tags:
 *       - {Component Tag}
 *     description: DELETE {Component} by Id API
 *     summary: Delete component
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ok
 *     parameters:
 *       - in: path
 *         name: model_id
 *         schema:
 *           type: integer
 *         required: true
 */
router.delete('/', verify_user_account, Controller.developingRoute)