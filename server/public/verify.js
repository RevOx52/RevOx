const boxes = document.querySelectorAll(".code-boxes input");

const status = document.getElementById("status");
const timerText = document.getElementById("timer");
const resendBtn = document.getElementById("resend");

const email = localStorage.getItem("email");


boxes.forEach((box,index)=>{

box.addEventListener("input",()=>{

box.value = box.value.replace(/[^0-9]/g,"");

if(box.value && index < boxes.length-1){
boxes[index+1].focus();
}

});


box.addEventListener("keydown",(e)=>{

if(e.key==="Backspace" && !box.value && index>0){
boxes[index-1].focus();
}

});

});



document.getElementById("verifyBtn").onclick = async()=>{

let code="";

boxes.forEach(b=>{
code+=b.value;
});


if(code.length!==6){

status.innerText="Введите 6 цифр";
return;

}


const res = await fetch(
"http://127.0.0.1:8080/api/auth/verify",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
code
})
});


const data = await res.json();


if(data.success){

status.innerText="Email подтверждён";

setTimeout(()=>{
location.href="index.html";
},1000);


}else{

status.innerText="Неверный код";

}

};



let seconds=60;

const interval=setInterval(()=>{

seconds--;

timerText.innerText =
`Повторная отправка через ${seconds} сек`;


if(seconds<=0){

clearInterval(interval);

timerText.style.display="none";
resendBtn.style.display="block";

}

},1000);



resendBtn.onclick=async()=>{

resendBtn.style.display="none";
timerText.style.display="block";

seconds=60;


const r = await fetch(
"http://127.0.0.1:8080/api/auth/register",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email
})
}
);


if(r.ok){
status.innerText="Новый код отправлен";
}


let t=setInterval(()=>{

seconds--;

timerText.innerText =
`Повторная отправка через ${seconds} сек`;


if(seconds<=0){

clearInterval(t);

timerText.style.display="none";
resendBtn.style.display="block";

}

},1000);


};
