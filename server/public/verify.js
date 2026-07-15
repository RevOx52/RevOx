const API = "http://127.0.0.1:8080";


document.getElementById("verify").onclick = async()=>{


const code =
document.getElementById("code").value.trim();


const email =
localStorage.getItem("email");


const status =
document.getElementById("status");


if(code.length !== 6){

    status.innerText =
    "Введите 6 цифр";

    return;

}


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


location.href="home.html";


}else{


status.innerText =
data.message || "Неверный код";


}



}catch(error){


console.log(error);

status.innerText =
"Сервер недоступен";


}



};
