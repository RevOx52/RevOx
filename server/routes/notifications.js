const express = require("express");

const database = require("../database");

const auth = require("../middleware/auth");

const router = express.Router();



router.get("/unread", auth, async(req,res)=>{

try{


const data =
await database.query(`

SELECT

COUNT(*) as count

FROM messages

JOIN chat_members

ON chat_members.chat_id=messages.chat_id


WHERE

chat_members.user_id=${req.user.id}

AND

messages.sender_id!=${req.user.id}

AND

messages.read=0


`);



res.json({

success:true,

count:data[0]?.count || 0

});



}catch(e){

console.log(e);

res.status(500).json({

success:false

});

}


});



module.exports=router;
