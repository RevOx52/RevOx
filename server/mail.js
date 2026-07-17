require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: false,

    family: 4,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }

});


module.exports = async function sendCode(email, code){

    console.log("Sending code to:", email);


    await transporter.sendMail({

        from: process.env.SMTP_USER,

        to: email,

        subject: "RevOx verification code",

        text:
        `Your RevOx code: ${code}`

    });


    console.log("Code sent!");

};
