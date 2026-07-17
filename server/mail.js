require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    host: "142.250.102.108",

    port: 587,

    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },

    tls: {
        rejectUnauthorized: false
    }

});


module.exports = async function sendCode(email, code){

    console.log("Sending code to:", email);


    await transporter.sendMail({

        from: process.env.SMTP_USER,

        to: email,

        subject: "RevOx verification code",

        text: `Your RevOx code: ${code}`

    });


    console.log("Code sent!");

};
