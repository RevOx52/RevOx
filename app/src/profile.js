import {

selectAvatar

} from "./camera.js";





const API =
"https://revox-yuyn.onrender.com";



const token =
localStorage.getItem("token");





const avatarBox =
document.getElementById("changeAvatar");



const avatar =
document.getElementById("avatar");



const avatarLetter =
document.getElementById("avatarLetter");



const name =
document.getElementById("name");



const email =
document.getElementById("email");









async function loadProfile(){



try{



const res =
await fetch(

API+"/api/user/me",

{

headers:{

Authorization:

"Bearer "+token

}

}

);






const data =
await res.json();





if(!data.success)
return;






const user =
data.user;





name.innerText =

`${user.first_name || ""} ${user.last_name || ""}`;



email.innerText =

user.email || "";






if(user.avatar){



avatar.src =

API+user.avatar;



avatar.style.display =
"block";



avatarLetter.style.display =
"none";



}else{



avatar.style.display =
"none";


avatarLetter.style.display =
"flex";



avatarLetter.innerText =

(user.first_name || "?")[0]

.toUpperCase();



}





}catch(error){


console.log(error);


}



}









avatarBox.addEventListener(

"click",

async()=>{



const photo =

await selectAvatar();





if(!photo)
return;





await uploadAvatar(photo);



}

);









async function uploadAvatar(image){



try{



const res =
await fetch(

API+"/api/upload/avatar",

{

method:"POST",

headers:{

"Content-Type":

"application/json",

Authorization:

"Bearer "+token

},


body:JSON.stringify({

image

})

}

);





const data =
await res.json();





if(data.success){


loadProfile();


}



}catch(error){


console.log(error);


}



}







loadProfile();
