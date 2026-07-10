const express = require("express");
const sendCode = require("../mail");

const router = express.Router();

const codes = {};

// временная база пользователей
const users = {};


// проверка есть ли пользователь
router.post("/check", (req, res)=>{

    const { email } = req.body;

    if(!email){
        return res.status(400).json({
            success:false,
            message:"Email required"
        });
    }


    res.json({
        exists: !!users[email]
    });

});



// отправка кода
router.post("/register", async (req,res)=>{

    const { email } = req.body;


    if(!email){
        return res.status(400).json({
            success:false,
            message:"Email required"
        });
    }


    const code =
    Math.floor(100000 + Math.random() * 900000);


    codes[email] = {
        code,
        expires: Date.now() + 5 * 60 * 1000
    };


    try{

        await sendCode(email, code);


        res.json({
            success:true,
            message:"Code sent"
        });


    }catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Email error"
        });

    }

});



// проверка кода
router.post("/verify",(req,res)=>{


    const { email, code } = req.body;


    const saved = codes[email];


    if(!saved){

        return res.status(400).json({
            success:false,
            message:"Code not found"
        });

    }



    if(Date.now() > saved.expires){

        delete codes[email];


        return res.status(400).json({
            success:false,
            message:"Code expired"
        });

    }



    if(String(saved.code) !== String(code)){


        return res.status(400).json({
            success:false,
            message:"Wrong code"
        });

    }



    delete codes[email];


    // создаём пользователя после подтверждения
    users[email] = {
        email,
        created: Date.now()
    };



    res.json({

        success:true,

        message:"Email verified"

    });


});



module.exports = router;
