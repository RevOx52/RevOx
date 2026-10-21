const jwt = require("jsonwebtoken");
const database = require("../database");

require("dotenv").config();

let io = null;

function validChatId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function initSocket(server) {
    io = require("socket.io")(server, {
        cors: {
            origin: "*"
        }
    });

    // Проверяем JWT до установления соединения.
    io.use(async (socket, next) => {
        try {
            const authToken = socket.handshake.auth?.token;
            const header = socket.handshake.headers?.authorization;

            const token =
                typeof authToken === "string" && authToken
                    ? authToken
                    : typeof header === "string" &&
                      header.startsWith("Bearer ")
                        ? header.slice(7)
                        : null;

            if (!token || !process.env.JWT_SECRET) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded.email || typeof decoded.email !== "string") {
                return next(new Error("Invalid token"));
            }

            await database.init();

            const email = decoded.email.replace(/'/g, "''");

            const users = await database.query(`
                SELECT id, email
                FROM users
                WHERE email = '${email}'
                LIMIT 1
            `);

            if (!users.length) {
                return next(new Error("User not found"));
            }

            socket.user = {
                id: Number(users[0].id),
                email: users[0].email
            };

            return next();
        } catch (error) {
            console.error("Socket authentication failed:", error.message);
            return next(new Error("Authentication failed"));
        }
    });

    io.on("connection", socket => {
        console.log("Authenticated socket:", socket.id);

        socket.on("joinChat", async value => {
            try {
                const chatId = validChatId(
                    typeof value === "object" && value !== null
                        ? value.chatId
                        : value
                );

                if (!chatId) {
                    socket.emit("chatError", {
                        message: "Invalid chat ID"
                    });
                    return;
                }

                const memberships = await database.query(`
                    SELECT id
                    FROM chat_members
                    WHERE chat_id = ${chatId}
                      AND user_id = ${socket.user.id}
                    LIMIT 1
                `);

                if (!memberships.length) {
                    socket.emit("chatError", {
                        message: "You are not a member of this chat"
                    });
                    return;
                }

                await socket.join("chat_" + chatId);

                socket.emit("chatJoined", {
                    chatId
                });
            } catch (error) {
                console.error("Socket joinChat failed:", error.message);

                socket.emit("chatError", {
                    message: "Could not join chat"
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
}

function sendMessage(chatId, message) {
    const id = validChatId(chatId);

    if (io && id) {
        io.to("chat_" + id).emit("new_message", message);
    }
}

module.exports = {
    initSocket,
    sendMessage
};
