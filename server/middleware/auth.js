const jwt = require("jsonwebtoken");
const database = require("../database");

require("dotenv").config();

async function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            success: false,
            message: "Token required"
        });
    }

    const parts = header.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization format"
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(
            parts[1],
            process.env.JWT_SECRET
        );

        if (!decoded.email || typeof decoded.email !== "string") {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
        }

        await database.init();

        const email = decoded.email.replace(/'/g, "''");

        const users = await database.query(
            `SELECT id, email FROM users WHERE email = '${email}' LIMIT 1`
        );

        if (!users.length) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = {
            ...decoded,
            id: users[0].id,
            email: users[0].email
        };

        return next();
    } catch (error) {
        if (error.message === "JWT_SECRET is not configured") {
            console.error("Authentication configuration error");
            return res.status(500).json({
                success: false,
                message: "Authentication service unavailable"
            });
        }

        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        console.error("Authentication error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

module.exports = auth;
