const button =
document.getElementById("continue");


const status =
document.getElementById("status");



button.onclick = ()=>{


const firstName =
document.getElementById("firstName").value.trim();


const lastName =
document.getElementById("lastName").value.trim();



if(!firstName || !lastName){

status.innerText =
"Заполните все поля";

return;

}



localStorage.setItem(
"firstName",
firstName
);


localStorage.setItem(
"lastName",
lastName
);



location.href =
"password.html";


};
