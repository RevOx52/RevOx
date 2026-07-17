const API = "https://revox-yuyn.onrender.com";


const button =
document.getElementById("create");


const status =
document.getElementById("status");



button.onclick = async()=>{


const password =
document.getElementById("password").value;


const confirm =
document.getElementById("confirm").value;



const email =
localStorage.getItem("email");


const firstName =
localStorage.getItem("firstName");


const lastName =
localStorage.getItem("lastName");



if(!password || !confirm){

status.innerText =
"Заполните поля";

return;

}



if(password.length < 6){

status.innerText =
"Пароль минимум 6 символов";

return;

}



if(password !== confirm){

status.innerText =
"Пароли разные";

return;

}



status.innerText =
"Создаём аккаунт...";



try{


const res = await fetch(
API + "/api/auth/set-password",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email,

password,

firstName,

lastName

})

});



const data =
await res.json();



if(data.success){


localStorage.setItem(
"token",
data.token
);



status.innerText =
"Аккаунт создан";


window.location.href =
"home.html";


}else{


status.innerText =
data.message ||
"Ошибка";


}



}catch(e){


console.log(e);

status.innerText =
"Ошибка сервера";


}


};
