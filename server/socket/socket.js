let io = null;


function initSocket(server) {


    io = require("socket.io")(server, {

        cors: {

            origin: "*"

        }

    });



    io.on("connection", (socket) => {


        console.log(
            "RevOx socket connected:",
            socket.id
        );



        socket.on(
            "joinChat",
            (chatId)=>{


                socket.join(
                    "chat_" + chatId
                );


                console.log(
                    "Joined chat:",
                    chatId
                );


            }
        );



        socket.on(
            "disconnect",
            ()=>{


                console.log(
                    "Socket disconnected:",
                    socket.id
                );


            }
        );


    });


    return io;

}



function sendMessage(
    chatId,
    message
){


    if(io){


        io.to(
            "chat_" + chatId
        )
        .emit(
            "message",
            message
        );


    }


}



module.exports = {

    initSocket,

    sendMessage

};
