const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function signToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(userDoc) {
    return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        createdAt: userDoc.createdAt,
    };
}

async function register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: { code: "VALIDATION_ERROR", detail: errors.array() }
            });
        }

        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                error: { code: "CONFLICT_EMAIL_EXISTS", message: "Email already in use" }
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, passwordHash });

        const token = signToken(user._id.toString());
        return res.status(201).json({
            token,
            user: publicUser(user),
        });
    }

    async function login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: { code: "VALIDATION_ERROR", detail: errors.array() }
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: { code: "UNAUTHORIZED", message: "Invalid credentials" }
            });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({
                error: { code: "UNAUTHORIZED", message: "Invalid credentials" }
            });
        }

        const token = signToken(user._id.toString());

        return res.status(200).json({
            token,
            user: publicUser(user),
        });
    }

    async function me(req, res) {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                error: { code: "UNAUTHORIZED", message: "User not found" }
            });
        }

        return res.status(200).json({
            user: publicUser(user)
        });
    }

    module.exports = { register, login, me };
