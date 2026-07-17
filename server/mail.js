require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: 587,

    secure: false,

    family: 4,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },

    tls: {
        rejectUnauthorized: false
    }

});


module.exports = async function sendCode(email, code){


    await transporter.sendMail({

        from: `"RevOx" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "RevOx verification code",

        text:
        `Your RevOx code: ${code}`

    });


};
