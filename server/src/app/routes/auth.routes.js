const router = require("express").Router();
const {body} = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// POST /api/auth/register
router.post("/register", [
    body("name").isString().trim().isLength({ min: 2, max: 50 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 72 }),
], authController.register
);

// POST /api/auth/login
router.post("/login", [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 1 }),
], authController.login
);

// GET /api/auth/me (protected)
router.get("/me", authMiddleware, authController.me);

module.exports = router;