const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const directionsController = require("../controllers/directions.controller");

router.use(authMiddleware);

router.post("/compute", directionsController.compute);

module.exports = router;