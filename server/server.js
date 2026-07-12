const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();


const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const chatsRoute = require("./routes/chats");
const messagesRoute = require("./routes/messages");

const {
    initSocket
} = require("./socket/socket");



const app = express();



app.use(cors());

app.use(express.json());



// HTTP сервер

const server =
    http.createServer(app);



// Socket.io

const io =
    initSocket(server);



// передаём socket в API

app.use(
    (req,res,next)=>{

        req.io = io;

        next();

    }
);



// проверка

app.get(
    "/",
    (req,res)=>{


        res.json({

            app:"RevOx",

            status:"online",

            socket:true

        });


    }
);



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




// запуск

const PORT =
    process.env.PORT || 8080;



server.listen(
    PORT,
    "0.0.0.0",
    ()=>{


        console.log(
            `RevOx server running on ${PORT}`
        );


    }
);
