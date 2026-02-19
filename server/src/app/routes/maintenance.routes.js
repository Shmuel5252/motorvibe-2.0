const router = require("express").Router();

const authMiddleware = require("../middlewares/auth.middleware");
const maintenanceController = require("../controllers/maintenance.controller");

router.use(authMiddleware);

// Alerts only (global)
// GET /api/maintenance/alerts
router.get("/alerts", maintenanceController.getMaintenanceAlerts);

module.exports = router;
