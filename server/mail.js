require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendCode(email, code) {

await transporter.sendMail({

from: `"RevOx Security" <${process.env.SMTP_USER}>`,

to: email,

subject: "Код подтверждения RevOx",

html: `
<div style="
font-family:Arial;
background:#0b0b0f;
padding:30px;
color:white;
">

<h1 style="color:#7c3aed;">
RevOx
</h1>

<h2>
Подтверждение email
</h2>

<p>
Здравствуйте!
</p>

<p>
Используйте этот код для подтверждения вашего адреса электронной почты:
</p>

<div style="
font-size:32px;
letter-spacing:8px;
font-weight:bold;
padding:20px;
background:#17171f;
border-radius:16px;
display:inline-block;
">
${code}
</div>

<p>
Код действителен в течение 5 минут.
</p>

<p style="color:#888">
Если вы не запрашивали этот код, просто проигнорируйте это письмо.
</p>

<hr>

<p style="color:#888">
RevOx Security Team
</p>

</div>
`

});

}

module.exports = sendCode;
