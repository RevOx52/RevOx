const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sendCode = require("../mail");
const database = require("../database");

const router = express.Router();

const codes = {};


// Проверка email
router.post("/check", async (req,res)=>{

    const { email } = req.body;

    if(!email){
        return res.status(400).json({
            success:false,
            message:"Email required"
        });
    }

    try {

        const users = await database.query(
            `SELECT id FROM users WHERE email='${email}'`
        );

        res.json({
            exists: users.length > 0
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Database error"
        });

    }

});



// Отправка кода
router.post("/register", async(req,res)=>{

    const { email } = req.body;

    if(!email){
        return res.status(400).json({
            success:false,
            message:"Email required"
        });
    }


    const code = Math.floor(
        100000 + Math.random() * 900000
    );


    codes[email] = {
        code: code,
        expires: Date.now() + 300000
    };


    try {

        await sendCode(email, code);

        res.json({
            success:true,
            message:"Code sent"
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Mail error"
        });

    }

});



// Проверка кода
router.post("/verify", (req,res)=>{

    const {
        email,
        code
    } = req.body;


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


    res.json({
        success:true
    });

});



// Создание аккаунта
router.post("/set-password", async(req,res)=>{

    const {
        email,
        password,
        firstName,
        lastName
    } = req.body;


    if(!email || !password || !firstName || !lastName){

        return res.status(400).json({
            success:false,
            message:"Data required"
        });

    }


    try {

        const hash = await bcrypt.hash(password,10);


        await database.run(`
        INSERT OR REPLACE INTO users
        (
            email,
            first_name,
            last_name,
            password,
            created_at
        )
        VALUES
        (
            '${email}',
            '${firstName}',
            '${lastName}',
            '${hash}',
            '${new Date().toISOString()}'
        )
        `);


        res.json({
            success:true,
            message:"Account created"
        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Database error"
        });

    }

});



// Вход + JWT
router.post("/login", async(req,res)=>{

    const {
        email,
        password
    } = req.body;


    if(!email || !password){

        return res.status(400).json({
            success:false,
            message:"Email and password required"
        });

    }


    try {

        const users = await database.query(
            `SELECT * FROM users WHERE email='${email}'`
        );


        if(users.length === 0){

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }


        const user = users[0];


        const match = await bcrypt.compare(
            password,
            user.password
        );


        if(!match){

            return res.status(401).json({
                success:false,
                message:"Wrong password"
            });

        }


        const token = jwt.sign(
            {
                id:user.id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"30d"
            }
        );


        res.json({

            success:true,

            token: token,

            user:{
                id:user.id,
                email:user.email,
                firstName:user.first_name,
                lastName:user.last_name
            }

        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Server error"
        });

    }

});


module.exports = router;
