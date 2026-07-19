const express = require("express");
const fs = require("fs");
const path = require("path");

const auth = require("../middleware/auth");
const database = require("../database");


const router = express.Router();



const uploadDir =

path.join(

__dirname,

"../uploads"

);



if(!fs.existsSync(uploadDir)){

fs.mkdirSync(uploadDir);

}







// изменить свой аватар

router.post("/avatar", auth, async(req,res)=>{


try{



const image = req.body.image;



if(!image){


return res.status(400).json({

success:false,

message:"Image required"

});


}






// удаляем старый формат

const base64 =

image

.replace(

/^data:image\/\w+;base64,/,

""

);






const filename =

"avatar_"

+

req.user.id

+

".png";







const filepath =

path.join(

uploadDir,

filename

);







fs.writeFileSync(

filepath,

Buffer.from(

base64,

"base64"

)

);







const avatar =

"/uploads/"+filename;







// ВАЖНО:
// id берётся только из токена

await database.run(`

UPDATE users

SET avatar='${avatar}'

WHERE id=${req.user.id}

`);







res.json({

success:true,

avatar

});






}catch(error){



console.log(error);



res.status(500).json({

success:false

});


}



});







// посмотреть аватар любого пользователя

router.get("/:userId", async(req,res)=>{


try{



const user =

await database.query(`

SELECT avatar

FROM users

WHERE id=${req.params.userId}

`);





if(!user.length){


return res.status(404).json({

success:false

});


}







res.json({

success:true,

avatar:user[0].avatar

});






}catch(error){



res.status(500).json({

success:false

});


}



});






module.exports = router;
