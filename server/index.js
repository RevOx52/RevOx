const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

require("dotenv").config();



const database =
require("./database");



const authRoute =
require("./routes/auth");


const userRoute =
require("./routes/user");


const chatsRoute =
require("./routes/chats");


const messagesRoute =
require("./routes/messages");


const uploadRoute =
require("./routes/upload");




const {
initSocket
}=require("./socket/socket");





const app =
express();





app.use(cors({

origin:"*"

}));




app.use(express.json({

limit:"10mb"

}));





// фотографии пользователей

app.use(

"/uploads",

express.static(

path.join(

__dirname,

"uploads"

)

)

);







const server =
http.createServer(app);




const io =
initSocket(server);






app.use((req,res,next)=>{


req.io = io;


next();


});







app.get("/",(req,res)=>{


res.json({

app:"RevOx",

status:"online",

socket:true

});


});







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



app.use(

"/api/upload",

uploadRoute

);






app.use((err,req,res,next)=>{


console.log(err);



res.status(500).json({

success:false

});


});







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

"RevOx server running",

PORT

);


}

);




}catch(error){


console.log(error);


}



}






start();
