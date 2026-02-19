const router = require('express').Router();
const { body } = require('express-validator');

const authMiddleware = require('../middlewares/auth.middleware');
const routesController = require('../controllers/routes.controller');

const pointValidator = (field) => [
    body(`${field}.lat`).isFloat({ min: -90, max: 90 }),
    body(`${field}.lng`).isFloat({ min: -180, max: 180 }),
    body(`${field}.label`).optional().isString().trim().isLength({ max: 80 }),
];

router.use(authMiddleware);

router.post('/',
    [
    body('title').isString().trim().isLength({ min: 2, max: 80 }),
    ...pointValidator('start'),
    ...pointValidator('end'),
    ],
    routesController.createRoute
);

router.get('/', routesController.listMyRoutes);

router.get('/:id', routesController.getMyRoute);

router.patch('/:id',
    [
        body('title').optional().isString().trim().isLength({ min: 2, max: 80 }),
        body('start').optional()
        .custom(value =>{
            if (typeof value !== 'object') throw new Error('start must be an object');
            if (value.lat === undefined || value.lng === undefined) {
                throw new Error('start.lat and start.lng are required');
            }
            return true;
        }),
        body('end').optional().custom(value =>{
            if (typeof value !== 'object') throw new Error('end must be an object');
            if (value.lat === undefined || value.lng === undefined) {
                throw new Error('end.lat and end.lng are required');
            }
            return true;
        }),
        body("start.lat").optional().isFloat({ min: -90, max: 90 }),
        body("start.lng").optional().isFloat({ min: -180, max: 180 }),
        body("start.label").optional().isString().trim().isLength({ max: 80 }),
        body("end.lat").optional().isFloat({ min: -90, max: 90 }),
        body("end.lng").optional().isFloat({ min: -180, max: 180 }),
        body("end.label").optional().isString().trim().isLength({ max: 80 }),
    ],
    routesController.updateMyRoute
);

router.delete('/:id', routesController.deleteMyRoute);

module.exports = router;