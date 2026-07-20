const admin = require("firebase-admin");

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
}

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();


async function sendNotification(token, title, body, data = {}) {

    if (!token) return false;

    try {

        await messaging.send({
            token,

            notification: {
                title,
                body
            },

            data
        });

        return true;

    } catch (error) {

        console.log(
            "Firebase notification error:",
            error.message
        );

        return false;
    }
}


async function sendMulticastNotification(tokens, title, body, data = {}) {

    if (!tokens || tokens.length === 0) {
        return false;
    }

    try {

        await messaging.sendEachForMulticast({

            tokens,

            notification: {
                title,
                body
            },

            data
        });


        return true;


    } catch(error) {

        console.log(
            "Firebase multicast error:",
            error.message
        );

        return false;

    }

}


module.exports = {
    admin,
    messaging,
    sendNotification,
    sendMulticastNotification
};
