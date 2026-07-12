const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();


const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const chatsRoute = require("./routes/chats");
const messagesRoute = require("./routes/messages");



const app = express();


app.use(cors());
app.use(express.json());



// HTTP сервер для Express + Socket.io

const server = http.createServer(app);



const io = new Server(server, {

    cors: {

        origin: "*"

    }

});




// Socket.io

io.on("connection", (socket)=>{


    console.log(
        "Socket connected:",
        socket.id
    );



    // Вход в комнату чата

    socket.on("join_chat",(chatId)=>{


        socket.join(
            "chat_" + chatId
        );


        console.log(
            "Joined chat:",
            chatId
        );


    });





    // Отправка сообщения в реальном времени

    socket.on("send_message",(data)=>{


        console.log(
            "New message:",
            data
        );



        io.to(
            "chat_" + data.chatId
        )
        .emit(
            "new_message",
            data
        );


    });






    socket.on("disconnect",()=>{


        console.log(
            "Socket disconnected:",
            socket.id
        );


    });


});






// Проверка сервера

app.get("/",(req,res)=>{


    res.json({

        app:"RevOx",

        status:"online",

        socket:true

    });


});






// API

app.use(
    "/api/auth",
    authRoute
);


app.use(
    "/api/user",
    userRoute
);


app.use(
    "/api/chats",
    chatsRoute
);


app.use(
    "/api/messages",
    messagesRoute
);






const PORT = process.env.PORT || 8080;



server.listen(
    PORT,
    "0.0.0.0",
    ()=>{


        console.log(
            `RevOx server running on ${PORT}`
        );


    }
);
