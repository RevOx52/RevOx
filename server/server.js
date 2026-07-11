require("dotenv").config();

const express = require("express");
const path = require("path");

const database = require("./database");


const app = express();

const PORT = process.env.PORT || 8080;


// JSON
app.use(express.json());


// Статика
app.use(express.static(
    path.join(__dirname, "public")
));


// API авторизации
const authRoute = require("./routes/auth");

app.use(
    "/api/auth",
    authRoute
);


// Проверка сервера
app.get("/api", (req,res)=>{

    res.json({

        success:true,
        app:"RevOx",
        version:"0.1",
        status:"online"

    });

});


// Главная страница
app.get("/", (req,res)=>{

    res.sendFile(

        path.join(
            __dirname,
            "public",
            "index.html"
        )

    );

});


// Запуск после загрузки базы

database.initDatabase()
.then(()=>{


    app.listen(PORT, ()=>{


        console.log(
            `RevOx server started on port ${PORT}`
        );


    });


})
.catch((error)=>{


    console.log(
        "Database error:",
        error
    );


});
