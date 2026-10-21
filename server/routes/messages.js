const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");
const firebase = require("../firebase");

const router = express.Router();

function escapeSql(value) {
    return String(value).replace(/'/g, "''");
}

function validId(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0
        ? number
        : null;
}

// Отправка сообщения
router.post("/send", auth, async (req, res) => {
    const chatId = validId(req.body.chatId);
    const text = req.body.text;

    if (!chatId || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({
            success: false,
            message: "Valid chatId and non-empty text required"
        });
    }

    if (text.length > 10000) {
        return res.status(400).json({
            success: false,
            message: "Message is too long"
        });
    }

    try {
        const userId = Number(req.user.id);

        // Отправитель должен состоять в чате.
        const membership = await database.query(`
            SELECT id
            FROM chat_members
            WHERE chat_id = ${chatId}
              AND user_id = ${userId}
            LIMIT 1
        `);

        if (!membership.length) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this chat"
            });
        }

        const time = new Date().toISOString();
        const safeText = escapeSql(text);

        await database.run(`
            INSERT INTO messages
                (chat_id, sender_id, text, created_at, "read")
            VALUES
                (${chatId}, ${userId}, '${safeText}', '${time}', 0)
        `);

        // Ищем именно что вставленное сообщение, а не последнее
        // сообщение любого пользователя в любой комнате.
        const messages = await database.query(`
            SELECT *
            FROM messages
            WHERE chat_id = ${chatId}
              AND sender_id = ${userId}
              AND created_at = '${time}'
              AND text = '${safeText}'
            ORDER BY id DESC
            LIMIT 1
        `);

        if (!messages.length) {
            throw new Error("Inserted message could not be retrieved");
        }

        const data = messages[0];

        if (req.io) {
            req.io.to("chat_" + chatId).emit("new_message", data);
        }

        // Push-уведомления — дополнительная функция:
        // их сбой не должен отменять уже сохранённое сообщение.
        try {
            const recipients = await database.query(`
                SELECT u.id, u.push_token
                FROM chat_members cm
                JOIN users u ON u.id = cm.user_id
                WHERE cm.chat_id = ${chatId}
                  AND cm.user_id != ${userId}
            `);

            for (const receiver of recipients) {
                if (!receiver.push_token) continue;

                try {
                    await firebase.messaging().send({
                        token: receiver.push_token,
                        notification: {
                            title: "🦆 RevOx",
                            body: text
                        },
                        data: {
                            chatId: String(chatId)
                        }
                    });
                } catch (pushError) {
                    console.error(
                        "Push notification failed:",
                        pushError.message
                    );
                }
            }
        } catch (pushError) {
            console.error(
                "Could not process push notifications:",
                pushError.message
            );
        }

        return res.json({
            success: true,
            message: data
        });
    } catch (error) {
        console.error("Send message failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not send message"
        });
    }
});

// История сообщений — только участникам чата.
router.get("/:chatId", auth, async (req, res) => {
    const chatId = validId(req.params.chatId);

    if (!chatId) {
        return res.status(400).json({
            success: false,
            message: "Invalid chat ID"
        });
    }

    try {
        const userId = Number(req.user.id);

        const membership = await database.query(`
            SELECT id
            FROM chat_members
            WHERE chat_id = ${chatId}
              AND user_id = ${userId}
            LIMIT 1
        `);

        if (!membership.length) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this chat"
            });
        }

        const messages = await database.query(`
            SELECT *
            FROM messages
            WHERE chat_id = ${chatId}
            ORDER BY id ASC
            LIMIT 1000
        `);

        return res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Load messages failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Could not load messages"
        });
    }
});

module.exports = router;
