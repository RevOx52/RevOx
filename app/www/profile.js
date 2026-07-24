const API =
"https://revox-yuyn.onrender.com";


const token =
localStorage.getItem("token");



if(!token){

location.href="index.html";

}




const avatar =
document.getElementById("avatar");


const avatarLetter =
document.getElementById("avatarLetter");


const name =
document.getElementById("name");


const email =
document.getElementById("email");


const changeAvatar =
document.getElementById("changeAvatar");









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



}catch(e){


console.log(e);


}



}










changeAvatar.addEventListener(

"click",

()=>{



const input =
document.createElement("input");


input.type =
"file";


input.accept =
"image/*";



input.onchange =
()=>{



const file =
input.files[0];



if(!file)
return;





const reader =
new FileReader();





reader.onload =
()=>{


uploadAvatar(

reader.result

);


};





reader.readAsDataURL(file);



};





input.click();



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



}catch(e){


console.log(e);


}



}






loadProfile();
