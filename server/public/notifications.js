const API =
"https://revox-yuyn.onrender.com";


const token =
localStorage.getItem("token");



async function checkUnread(){


try{


const res =
await fetch(

API+
"/api/notifications/unread",

{

headers:{

Authorization:
"Bearer "+token

}

}

);



const data =
await res.json();



const badge =
document.getElementById(
"unreadCount"
);



if(badge && data.success){


if(data.count>0){


badge.innerText =
data.count;


badge.style.display =
"block";


}else{


badge.style.display =
"none";


}



}



}catch(e){

console.log(e);

}


}



setInterval(
checkUnread,
5000
);


checkUnread();
