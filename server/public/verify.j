const API = "http://10.146.27.204:8080";


const button =
document.getElementById("verify");


const status =
document.getElementById("status");



button.onclick = async () => {


const code =
document.getElementById("code")
.value
.trim();


const email =
localStorage.getItem("email");


if(!email){

    status.innerText =
    "Email не найден";

    return;

}


if(code.length !== 6){

    status.innerText =
    "Введите 6 цифр";

    return;

}


status.innerText =
"Проверяем...";


try{


const response =
await fetch(
API + "/api/auth/verify",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email,
code:code
})

});


const data =
await response.json();


if(data.success){

window.location.href =
"home.html";

}else{

status.innerText =
data.message || "Неверный код";

}


}catch(error){

console.log(error);

status.innerText =
"Ошибка сервера";

}


};
