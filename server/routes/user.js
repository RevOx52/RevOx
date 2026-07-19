const express = require("express");

const database = require("../database");

const auth = require("../middleware/auth");


const router = express.Router();






// поиск пользователей

router.get("/search", auth, async(req,res)=>{


try{


const q =

(req.query.q || "")

.trim()

.replace(/'/g,"''");



if(!q){

return res.json({

success:true,

users:[]

});

}



const users =

await database.query(`

SELECT

id,

username,

email,

first_name,

last_name,

avatar

FROM users

WHERE

(

username LIKE '%${q}%'

OR email LIKE '%${q}%'

OR first_name LIKE '%${q}%'

OR last_name LIKE '%${q}%'

)

AND id != ${req.user.id}

LIMIT 50

`);




res.json({

success:true,

users

});



}catch(error){


console.log(error);


res.status(500).json({

success:false

});


}



});









// профиль себя

router.get("/me", auth, async(req,res)=>{


try{



const user =

await database.query(`

SELECT

id,

username,

email,

first_name,

last_name,

avatar

FROM users

WHERE id=${req.user.id}

`);





res.json({

success:true,

user:user[0]

});





}catch(error){


res.status(500).json({

success:false

});


}



});









// сохранить FCM токен

router.post("/push-token", auth, async(req,res)=>{


try{



const {

token

}=req.body;





if(!token){


return res.status(400).json({

success:false,

message:"Token required"

});


}







await database.run(`

UPDATE users

SET push_token='${token.replace(/'/g,"''")}'

WHERE id=${req.user.id}

`);







res.json({

success:true

});






}catch(error){


console.log(error);


res.status(500).json({

success:false

});


}



});









// обновление профиля

router.put("/update", auth, async(req,res)=>{


try{


const {

username,

first_name,

last_name,

avatar

}=req.body;





await database.run(`

UPDATE users

SET

username='${(username||"").replace(/'/g,"''")}',

first_name='${(first_name||"").replace(/'/g,"''")}',

last_name='${(last_name||"").replace(/'/g,"''")}',

avatar='${(avatar||"").replace(/'/g,"''")}'

WHERE id=${req.user.id}

`);






res.json({

success:true

});





}catch(error){


console.log(error);


res.status(500).json({

success:false

});


}



});







module.exports = router;
