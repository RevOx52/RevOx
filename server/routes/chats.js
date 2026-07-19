const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();



// список чатов пользователя
router.get("/", auth, async (req, res) => {
    try {

        const chats = await database.query(`
SELECT
c.id,
u.first_name,
u.last_name,
u.username,
u.avatar,
(
SELECT text
FROM messages
WHERE chat_id=c.id
ORDER BY id DESC
LIMIT 1
) AS last_message
FROM chats c
JOIN chat_members me
ON me.chat_id=c.id
JOIN chat_members other
ON other.chat_id=c.id
AND other.user_id!=${req.user.id}
JOIN users u
ON u.id=other.user_id
WHERE me.user_id=${req.user.id}
ORDER BY c.id DESC
`);

        res.json({
            success: true,
            chats
        });

    } catch (e) {

        console.log(e);

        res.status(500).json({
            success: false
        });

    }
});




// создать личный чат
router.post("/create", auth, async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId) {

            return res.json({
                success: false
            });

        }



        const exists =
await database.query(`
SELECT c.id
FROM chats c
JOIN chat_members a
ON a.chat_id=c.id
JOIN chat_members b
ON b.chat_id=c.id
WHERE
a.user_id=${req.user.id}
AND
b.user_id=${userId}
LIMIT 1
`);



        if (exists.length) {

            return res.json({

                success: true,

                chat_id: exists[0].id

            });

        }



        await database.run(`
INSERT INTO chats(created_at)
VALUES(datetime('now'))
`);



        const chat =
await database.query(`
SELECT id
FROM chats
ORDER BY id DESC
LIMIT 1
`);



        const chatId =
chat[0].id;



        await database.run(`
INSERT INTO chat_members(chat_id,user_id)
VALUES(${chatId},${req.user.id})
`);



        await database.run(`
INSERT INTO chat_members(chat_id,user_id)
VALUES(${chatId},${userId})
`);



        res.json({

            success: true,

            chat_id: chatId

        });

    } catch (e) {

        console.log(e);

        res.status(500).json({

            success: false

        });

    }

});



module.exports = router;
