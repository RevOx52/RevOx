const jwt = require("jsonwebtoken");
require("dotenv").config();


function auth(req,res,next){

    const header = req.headers.authorization;


    if(!header){

        return res.status(401).json({
            success:false,
            message:"Token required"
        });

    }


    const parts = header.split(" ");

    if(parts.length !== 2 || parts[0] !== "Bearer"){

        return res.status(401).json({
            success:false,
            message:"Invalid authorization format"
        });

    }


    try {

        const decoded = jwt.verify(
            parts[1],
            process.env.JWT_SECRET
        );


        req.user = decoded;

        next();


    } catch(error){

        return res.status(401).json({
            success:false,
            message:"Invalid token"
        });

    }

}


module.exports = auth;
