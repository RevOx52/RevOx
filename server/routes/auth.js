const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomInt } = require("crypto");
require("dotenv").config();

const sendCode = require("../mail");
const database = require("../database");
const router = express.Router();

const codes = new Map();
const verifiedEmails = new Map();

const CODE_TTL = 5 * 60 * 1000;
const VERIFIED_TTL = 10 * 60 * 1000;

function normalizeEmail(value) {
    return typeof value === "string"
        ? value.trim().toLowerCase()
        : "";
}

function escapeSql(value) {
    return String(value ?? "").replace(/'/g, "''");
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "5y" }
    );
}

function publicUser(user) {
    return {
        id: user.id,
        email: user.email,
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        avatar: user.avatar || ""
    };
}

async function findUser(email) {
    const safeEmail = escapeSql(email);

    const users = await database.query(`
        SELECT id, email, username, first_name, last_name, avatar, password
        FROM users
        WHERE email = '${safeEmail}'
        LIMIT 1
    `);

    return users[0] || null;
}

// Проверка, существует ли аккаунт.
router.post("/check", async (req, res) => {
    const email = normalizeEmail(req.body?.email);

    if (!validEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email"
        });
    }

    try {
        await database.init();
        const user = await findUser(email);
        return res.json({ exists: Boolean(user) });
    } catch (error) {
        console.error("Auth check error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Could not check account"
        });
    }
});

// Отправка кода как для входа, так и для регистрации.
router.post("/register", async (req, res) => {
    const email = normalizeEmail(req.body?.email);

    if (!validEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email"
        });
    }

    try {
        await database.init();

        const code = String(randomInt(100000, 1000000));

        codes.set(email, {
            code,
            expires: Date.now() + CODE_TTL
        });

        verifiedEmails.delete(email);

        try {
            await sendCode(email, code);
        } catch (error) {
            codes.delete(email);
            throw error;
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("Send verification code error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Could not send verification email"
        });
    }
});

// Проверка кода. Для существующего аккаунта возвращает JWT.
// Для нового подтверждает email и разрешает создать профиль.
router.post("/verify", async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code ?? "").trim();
    const saved = codes.get(email);

    if (!validEmail(email) || !saved) {
        return res.status(400).json({
            success: false,
            message: "Code not found or expired"
        });
    }

    if (Date.now() > saved.expires) {
        codes.delete(email);
        return res.status(400).json({
            success: false,
            message: "Code expired"
        });
    }

    if (code !== saved.code) {
        return res.status(400).json({
            success: false,
            message: "Wrong code"
        });
    }

    try {
        await database.init();

        const user = await findUser(email);
        codes.delete(email);

        if (user) {
            const token = makeToken(user);

            return res.json({
                success: true,
                exists: true,
                token,
                user: publicUser(user)
            });
        }

        verifiedEmails.set(email, Date.now() + VERIFIED_TTL);

        return res.json({
            success: true,
            exists: false,
            needsRegistration: true
        });
    } catch (error) {
        console.error("Verify code error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Verification failed"
        });
    }
});

// Завершение регистрации после подтверждения email.
// Пароль, фамилия, username и аватар необязательны.
router.post("/complete-registration", async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const firstName = typeof req.body?.firstName === "string"
        ? req.body.firstName.trim()
        : "";
    const lastName = typeof req.body?.lastName === "string"
        ? req.body.lastName.trim()
        : "";
    const username = typeof req.body?.username === "string"
        ? req.body.username.trim()
        : "";
    const avatar = typeof req.body?.avatar === "string"
        ? req.body.avatar.trim()
        : "";
    const password = typeof req.body?.password === "string"
        ? req.body.password
        : "";

    const verifiedUntil = verifiedEmails.get(email);

    if (!validEmail(email) || !verifiedUntil || Date.now() > verifiedUntil) {
        verifiedEmails.delete(email);
        return res.status(403).json({
            success: false,
            message: "Verify your email first"
        });
    }

    if (!firstName || firstName.length > 80 ||
        lastName.length > 80 ||
        username.length > 40 ||
        avatar.length > 2000 ||
        password.length > 200) {
        return res.status(400).json({
            success: false,
            message: "Invalid profile data"
        });
    }

    try {
        await database.init();

        if (await findUser(email)) {
            verifiedEmails.delete(email);
            return res.status(409).json({
                success: false,
                message: "Account already exists"
            });
        }

        if (username) {
            const existingUsername = await database.query(`
                SELECT id FROM users
                WHERE username = '${escapeSql(username)}'
                LIMIT 1
            `);

            if (existingUsername.length) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }

        const passwordHash = password
            ? await bcrypt.hash(password, 10)
            : "";

        await database.run(`
            INSERT INTO users (
                email, username, first_name, last_name,
                avatar, password, created_at
            ) VALUES (
                '${escapeSql(email)}',
                ${username ? `'${escapeSql(username)}'` : "NULL"},
                '${escapeSql(firstName)}',
                '${escapeSql(lastName)}',
                '${escapeSql(avatar)}',
                '${escapeSql(passwordHash)}',
                '${new Date().toISOString()}'
            )
        `);

        const user = await findUser(email);

        if (!user) {
            throw new Error("Created user could not be found");
        }

        const token = makeToken(user);
        verifiedEmails.delete(email);

        return res.status(201).json({
            success: true,
            token,
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Complete registration error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Could not create account"
        });
    }
});

// Совместимость со старым клиентом, который регистрирует аккаунт
// через /set-password после успешной проверки email.
router.post("/set-password", async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const firstName = typeof req.body?.firstName === "string"
        ? req.body.firstName.trim()
        : "";
    const lastName = typeof req.body?.lastName === "string"
        ? req.body.lastName.trim()
        : "";
    const username = typeof req.body?.username === "string"
        ? req.body.username.trim()
        : "";
    const avatar = typeof req.body?.avatar === "string"
        ? req.body.avatar.trim()
        : "";

    const verifiedUntil = verifiedEmails.get(email);

    if (!validEmail(email) || !verifiedUntil || Date.now() > verifiedUntil) {
        return res.status(403).json({
            success: false,
            message: "Verify your email first"
        });
    }

    if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 200 ||
        !firstName ||
        !username
    ) {
        return res.status(400).json({
            success: false,
            message: "Password (8+ characters), first name and username required"
        });
    }

    try {
        await database.init();

        if (await findUser(email)) {
            return res.status(409).json({
                success: false,
                message: "Account already exists"
            });
        }

        const existingUsername = await database.query(`
            SELECT id FROM users
            WHERE username = '${escapeSql(username)}'
            LIMIT 1
        `);

        if (existingUsername.length) {
            return res.status(409).json({
                success: false,
                message: "Username is already taken"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        await database.run(`
            INSERT INTO users (
                email, username, first_name, last_name,
                avatar, password, created_at
            ) VALUES (
                '${escapeSql(email)}',
                '${escapeSql(username)}',
                '${escapeSql(firstName)}',
                '${escapeSql(lastName)}',
                '${escapeSql(avatar)}',
                '${escapeSql(hash)}',
                '${new Date().toISOString()}'
            )
        `);

        const user = await findUser(email);
        const token = makeToken(user);
        verifiedEmails.delete(email);

        return res.status(201).json({
            success: true,
            token,
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Legacy registration error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Account creation failed"
        });
    }
});

// Старый вход по паролю оставлен для обратной совместимости.
router.post("/login", async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!validEmail(email) || typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Email and password required"
        });
    }

    try {
        await database.init();

        const user = await findUser(email);

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.json({
            success: true,
            token: makeToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

module.exports = router;
