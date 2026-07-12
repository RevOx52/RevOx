const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();


// Отправить сообщение
router.post("/send", auth, async(req,res)=>{

    const {
        chatId,
        text
    } = req.body;


    if(!chatId || !text){

        return res.status(400).json({
            success:false,
            message:"Chat id and text required"
        });

    }


    try {

        await database.run(`
            INSERT INTO messages
            (
                chat_id,
                sender_id,
                text,
                created_at
            )
            VALUES
            (
                ${chatId},
                ${req.user.id},
                '${text.replace(/'/g,"''")}',
                '${new Date().toISOString()}'
            )
        `);


        res.json({

            success:true,

            message:"Message sent"

        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Database error"
        });

    }

});



// Получить сообщения чата
router.get("/:chatId", auth, async(req,res)=>{

    const chatId = req.params.chatId;


    try {


        const messages = await database.query(`
            SELECT *
            FROM messages
            WHERE chat_id=${chatId}
            ORDER BY id ASC
        `);


        res.json({

            success:true,

            messages:messages

        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false
        });

    }

});


module.exports = router;
