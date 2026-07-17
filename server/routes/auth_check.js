const express = require("express");
const database = require("../database");

const router = express.Router();

router.post("/check", async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email required"
        });
    }

    try {

        const users = await database.query(
            `SELECT id FROM users WHERE email='${email}'`
        );

        res.json({
            exists: users.length > 0
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Database error"
        });

    }

});

module.exports = router;
