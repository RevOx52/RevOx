async function login(){

const email = document.getElementById("email").value;
const status = document.getElementById("status");

if(!email){
 status.innerText="Введите email";
 return;
}

status.innerText="Проверка...";

try {

const response = await fetch(
"http://127.0.0.1:8080/api/status"
);

const data = await response.json();

if(data.status==="online"){
 status.innerText="Сервер RevOx онлайн";
}

} catch(e){

status.innerText="Ошибка подключения";

}

}
