const express = require("express");

const database = require("../database");

const auth = require("../middleware/auth");

const firebase = require("../firebase");


const router = express.Router();







// отправка сообщения

router.post("/send", auth, async(req,res)=>{


const {

chatId,

text

}=req.body;





if(!chatId || !text){


return res.status(400).json({

success:false,

message:"Data required"

});


}







try{



const time =

new Date().toISOString();






await database.run(`

INSERT INTO messages

(

chat_id,

sender_id,

text,

created_at,

read

)

VALUES

(

${chatId},

${req.user.id},

'${text.replace(/'/g,"''")}',

'${time}',

0

)

`);








const message =

await database.query(`

SELECT *

FROM messages

ORDER BY id DESC

LIMIT 1

`);





const data = message[0];








if(req.io){


req.io

.to("chat_"+chatId)

.emit(

"new_message",

data

);


}








// найти получателя

const users =

await database.query(`

SELECT user_id

FROM chat_members

WHERE chat_id=${chatId}

AND user_id!=${req.user.id}

`);









for(const user of users){



const receiver =

await database.query(`

SELECT push_token

FROM users

WHERE id=${user.user_id}

`);





const pushToken =

receiver[0]?.push_token;







if(pushToken){



await firebase.messaging().send({



token:pushToken,



notification:{


title:"🦆 RevOx",


body:text



},



data:{


chatId:String(chatId)


}



});



}



}









res.json({

success:true,

message:data

});







}catch(error){



console.log(error);



res.status(500).json({

success:false

});



}



});








// получить сообщения

router.get("/:chatId",auth,async(req,res)=>{


try{



const messages =

await database.query(`

SELECT *

FROM messages

WHERE chat_id=${req.params.chatId}

ORDER BY id ASC

`);





res.json({

success:true,

messages

});






}catch(error){



res.status(500).json({

success:false

});


}



});








module.exports = router;
