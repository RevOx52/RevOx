const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();


const database = require("./database");


const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const chatsRoute = require("./routes/chats");
const messagesRoute = require("./routes/messages");


const {
    initSocket
} = require("./socket/socket");



const app = express();



app.use(cors({

    origin: "*",

    methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]

}));



app.use(express.json());



// Лог всех запросов

app.use((req,res,next)=>{

    console.log(
        "REQUEST:",
        req.method,
        req.url
    );

    next();

});




// HTTP сервер

const server = http.createServer(app);



// Socket.io

const io = initSocket(server);



// Передача socket в API

app.use((req,res,next)=>{

    req.io = io;

    next();

});




// Проверка сервера

app.get("/", (req,res)=>{

    res.json({

        app:"RevOx",

        status:"online",

        socket:true,

        time:new Date().toISOString()

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




// Ошибки

app.use((err,req,res,next)=>{

    console.log(
        "ERROR:",
        err
    );


    res.status(500).json({

        success:false,

        message:"Server error"

    });

});





// Запуск

const PORT =
process.env.PORT || 8080;



async function start(){

    try{


        await database.init();



        server.listen(

            PORT,

            "0.0.0.0",

            ()=>{

                console.log(
                    `RevOx server running on ${PORT}`
                );

            }

        );


    }catch(error){


        console.log(
            "DATABASE START ERROR:"
        );


        console.log(error);


        process.exit(1);


    }

}



start();
