const API =
"https://revox-yuyn.onrender.com";


const token =
localStorage.getItem("token");



if(!token){

location.href="index.html";

}





const chatList =
document.getElementById("chatList");





async function loadChats(){


try{


const res =
await fetch(

API+
"/api/chats",

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




chatList.innerHTML="";





data.chats.forEach(chat=>{


const div =
document.createElement("div");



div.className =
"chat";





div.innerHTML = `


<div class="avatar">


${
chat.avatar
?
`<img src="${chat.avatar}">`
:
(chat.first_name || "?")[0].toUpperCase()

}


</div>




<div class="chat-info">


<h3>

${chat.first_name || ""}
${chat.last_name || ""}

</h3>



<p>

${chat.last_message || "Нет сообщений"}

</p>



</div>



<div class="unread"

id="unread-${chat.id}">

</div>


`;






div.onclick = ()=>{


location.href=

"chat.html?id="+chat.id;


};





chatList.appendChild(div);



});





}catch(error){


console.log(
"Chats error",
error
);


}



}









async function updateUnread(){



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
"globalUnread"
);





if(
badge &&
data.success
){


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









document

.getElementById("addChat")

?.addEventListener(

"click",

()=>{


location.href=
"contacts.html";


}

);









setInterval(

updateUnread,

5000

);



loadChats();

updateUnread();
