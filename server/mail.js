require("dotenv").config();

const { Resend } = require("resend");


const resend = new Resend(
    process.env.RESEND_API_KEY
);



module.exports = async function sendCode(email, code){

    console.log("Sending code to:", email);


    const result = await resend.emails.send({

        from: "RevOx <onboarding@resend.dev>",

        to: email,

        subject: "RevOx verification code",

        text:
        `Your RevOx verification code: ${code}`

    });


    console.log("Code sent!", result);

};
