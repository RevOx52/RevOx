const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();


// Создание чата
router.post("/create", auth, async(req,res)=>{

    const { userId } = req.body;


    if(!userId){

        return res.status(400).json({
            success:false,
            message:"User id required"
        });

    }


    try {

        await database.run(`
            INSERT INTO chats
            (
                user1,
                user2,
                created_at
            )
            VALUES
            (
                ${req.user.id},
                ${userId},
                '${new Date().toISOString()}'
            )
        `);


        res.json({
            success:true,
            message:"Chat created"
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Database error"
        });

    }

});



// Получить чаты пользователя
router.get("/", auth, async(req,res)=>{

    try {

        const chats = await database.query(`
            SELECT *
            FROM chats
            WHERE user1=${req.user.id}
            OR user2=${req.user.id}
        `);


        res.json({

            success:true,

            chats:chats

        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false
        });

    }

});


module.exports = router;
