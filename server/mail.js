require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

host:process.env.SMTP_HOST,

port:process.env.SMTP_PORT,

secure:false,

auth:{
user:process.env.SMTP_USER,
pass:process.env.SMTP_PASS
}

});


module.exports = async function sendCode(email,code){

await transporter.sendMail({

from:process.env.SMTP_USER,

to:email,

subject:"RevOx verification code",

text:
`Your RevOx code: ${code}`

});

};
