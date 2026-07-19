let io = null;



function initSocket(server){



io =
require("socket.io")(server,{

cors:{

origin:"*"

}

});





io.on(

"connection",

socket=>{


console.log(
"Socket:",
socket.id
);





socket.on(

"joinChat",

chatId=>{


socket.join(

"chat_"+chatId

);


});





socket.on(

"disconnect",

()=>{


console.log(
"Socket off:",
socket.id
);


}

);



}

);





return io;

}





function sendMessage(chatId,message){


if(io){


io.to(

"chat_"+chatId

)
.emit(

"new_message",

message

);


}



}





module.exports={

initSocket,

sendMessage

};
