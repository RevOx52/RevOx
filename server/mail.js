require("dotenv").config();

const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

module.exports = async function sendCode(email, code) {
    if (!resend) {
        throw new Error(
            "Email service is not configured: RESEND_API_KEY is missing"
        );
    }

    const result = await resend.emails.send({
        from: "RevOx <onboarding@resend.dev>",
        to: email,
        subject: "RevOx verification code",
        text: `Your RevOx verification code: ${code}`
    });

    if (result.error) {
        console.error("Email delivery failed:", result.error.message);
        throw new Error("Could not send verification email");
    }

    console.log("Verification email accepted by Resend");
    return result;
};
