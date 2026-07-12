const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();


// отправка сообщения
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


    try{


        const db = database.getDB();



        db.run(
            `
            INSERT INTO messages
            (
                chat_id,
                sender_id,
                text,
                created_at
            )
            VALUES
            (?,?,?,?)
            `,
            [
                chatId,
                req.user.id,
                text,
                new Date().toISOString()
            ]
        );



        database.saveDatabase();



        const message = {

            chatId: chatId,

            senderId: req.user.id,

            text: text,

            createdAt: new Date().toISOString()

        };



        // отправка через Socket.io

        if(req.io){

            req.io
            .to("chat_" + chatId)
            .emit(
                "new_message",
                message
            );

        }




        res.json({

            success:true,

            message:"Message sent",

            data:message

        });



    }catch(error){


        console.log(error);



        res.status(500).json({

            success:false,

            message:"Server error"

        });


    }


});





// получить сообщения

router.get("/:chatId", auth, async(req,res)=>{


    try{


        const db = database.getDB();



        const result = db.exec(
            `
            SELECT *
            FROM messages
            WHERE chat_id=?
            ORDER BY id ASC
            `,
            [
                req.params.chatId
            ]
        );



        let messages=[];


        if(result.length){

            messages =
            result[0].values.map(row=>({

                id:row[0],

                chatId:row[1],

                senderId:row[2],

                text:row[3],

                createdAt:row[4]

            }));

        }



        res.json({

            success:true,

            messages:messages

        });



    }catch(error){


        console.log(error);


        res.status(500).json({

            success:false

        });


    }


});



module.exports = router;
