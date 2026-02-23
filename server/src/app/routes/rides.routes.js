const router = require('express').Router();
const { body } = require('express-validator');

const authMiddleware = require('../middlewares/auth.middleware');
const { startRide, stopRide, getActiveRide, getRideHistory, updateRide } = require('../controllers/rides.controller');

router.use(authMiddleware);

router.post(
    '/start',
    body('routeId').optional({ nullable: true, checkFalsy: true }).isMongoId(),
    startRide
);

router.post('/stop', stopRide);

router.get('/active', getActiveRide);
router.get('/history', getRideHistory);

router.patch(
    '/:id',
    body('name').optional({ checkFalsy: true }).isString().trim().isLength({ max: 60 }),
    updateRide
);

module.exports = router;