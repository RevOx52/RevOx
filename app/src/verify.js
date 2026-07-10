const boxes = document.querySelectorAll(".code-boxes input");

boxes.forEach((box, index)=>{

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


async function verifyCode(){

let code="";

boxes.forEach(b=>{
 code+=b.value;
});


if(code.length!==6){
 document.getElementById("status").innerText="Введите 6 цифр";
 return;
}


const email=localStorage.getItem("email");


const res=await fetch(
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


const data=await res.json();


if(data.success){

location.href="index.html";

}else{

document.getElementById("status").innerText=
"Неверный код";

}

}
