require("dotenv").config();

const admin = require("firebase-admin");

let firebaseReady = false;

try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (raw) {
        const serviceAccount = JSON.parse(raw);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        firebaseReady = true;
        console.log("Firebase Admin initialized");
    } else {
        console.warn(
            "Firebase is not configured; push notifications are disabled"
        );
    }
} catch (error) {
    console.error(
        "Firebase initialization failed; push notifications disabled:",
        error.message
    );
}

const messaging = {
    async send(message) {
        if (!firebaseReady) return false;
        return admin.messaging().send(message);
    },

    async sendEachForMulticast(message) {
        if (!firebaseReady) {
            return { successCount: 0, failureCount: message.tokens?.length || 0 };
        }

        return admin.messaging().sendEachForMulticast(message);
    }
};

async function sendNotification(token, title, body, data = {}) {
    if (!token || !firebaseReady) return false;

    try {
        await messaging.send({
            token,
            notification: { title, body },
            data
        });

        return true;
    } catch (error) {
        console.error("Firebase notification error:", error.message);
        return false;
    }
}

async function sendMulticastNotification(tokens, title, body, data = {}) {
    if (!tokens?.length || !firebaseReady) return false;

    try {
        await messaging.sendEachForMulticast({
            tokens,
            notification: { title, body },
            data
        });

        return true;
    } catch (error) {
        console.error("Firebase multicast error:", error.message);
        return false;
    }
}

module.exports = {
    admin,
    messaging: () => messaging,
    sendNotification,
    sendMulticastNotification
};
