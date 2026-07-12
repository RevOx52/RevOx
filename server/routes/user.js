const express = require("express");
const database = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();


router.get("/me", auth, async(req,res)=>{

    try {

        const users = await database.query(
            `SELECT id,email,first_name,last_name,created_at FROM users WHERE id=${req.user.id}`
        );


        if(users.length === 0){

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }


        const user = users[0];


        res.json({

            success:true,

            user:{
                id:user.id,
                email:user.email,
                firstName:user.first_name,
                lastName:user.last_name,
                createdAt:user.created_at
            }

        });


    } catch(error){

        console.log(error);

        res.status(500).json({
            success:false,
            message:"Database error"
        });

    }

});


module.exports = router;
