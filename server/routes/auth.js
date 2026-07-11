const express = require("express");
const bcrypt = require("bcryptjs");

const sendCode = require("../mail");
const database = require("../database");


const router = express.Router();


const codes = {};




// Проверка пользователя

router.post("/check",(req,res)=>{


    const {email}=req.body;


    if(!email){

        return res.status(400).json({

            success:false,

            message:"Email required"

        });

    }



    const db =
    database.getDB();



    const result =
    db.exec(

        "SELECT id FROM users WHERE email=?",

        [email]

    );



    res.json({

        exists:
        result.length > 0

    });



});





// Отправка кода

router.post("/register",async(req,res)=>{


    const {email}=req.body;



    if(!email){

        return res.status(400).json({

            success:false,

            message:"Email required"

        });

    }



    const code =
    Math.floor(
        100000 + Math.random()*900000
    );



    codes[email]={

        code,

        expires:
        Date.now()+5*60*1000

    };



    try{


        await sendCode(
            email,
            code
        );



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






// Проверка кода

router.post("/verify",(req,res)=>{


    const {
        email,
        code
    } = req.body;



    const saved =
    codes[email];



    if(!saved){

        return res.status(400).json({

            success:false,

            message:"Code not found"

        });

    }



    if(Date.now()>saved.expires){


        delete codes[email];


        return res.status(400).json({

            success:false,

            message:"Code expired"

        });

    }




    if(String(saved.code)!==String(code)){


        return res.status(400).json({

            success:false,

            message:"Wrong code"

        });

    }



    delete codes[email];



    res.json({

        success:true

    });



});






// Сохранение профиля + пароля

router.post("/set-password",async(req,res)=>{


    const {

        email,

        password,

        firstName,

        lastName

    } = req.body;




    if(
        !email ||
        !password ||
        !firstName ||
        !lastName
    ){

        return res.status(400).json({

            success:false,

            message:"Data required"

        });

    }




    const hash =
    await bcrypt.hash(password,10);




    const db =
    database.getDB();




    db.run(

    `INSERT OR REPLACE INTO users
    (
        email,
        first_name,
        last_name,
        password,
        created_at
    )

    VALUES (?,?,?,?,?)

    `,

    [

        email,

        firstName,

        lastName,

        hash,

        new Date().toISOString()

    ]

    );




    database.saveDatabase();




    res.json({

        success:true,

        message:"Account created"

    });



});





module.exports = router;
