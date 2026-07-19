const API =
"https://revox-yuyn.onrender.com";


const token =
localStorage.getItem("token");


if(!token){

location.href="index.html";

}



const chatId =
new URLSearchParams(
location.search
).get("id");



localStorage.setItem(
"currentChat",
chatId
);





const messagesBox =
document.getElementById("messages");


const input =
document.getElementById("message");


const send =
document.getElementById("send");





const loadedMessages =
new Set();








function getUserId(){


try{


return JSON.parse(

atob(
token.split(".")[1]
)

).id;



}catch{


return null;


}



}









function showMessage(msg){



if(!msg.id)
return;



if(loadedMessages.has(msg.id))
return;



loadedMessages.add(msg.id);






const div =
document.createElement("div");



div.className =

"message " +

(

String(msg.sender_id)
===
String(getUserId())

?

"mine"

:

"other"

);






const time =
new Date(
msg.created_at
)

.toLocaleTimeString(

[],

{

hour:"2-digit",

minute:"2-digit"

}

);






div.innerHTML = `


<div class="text">

${msg.text}

</div>


<div class="time">

${time}

</div>


`;




messagesBox.appendChild(div);



messagesBox.scrollTop =
messagesBox.scrollHeight;


}









async function loadMessages(){



const res =
await fetch(

API+
"/api/messages/"+
chatId,

{

headers:{

Authorization:

"Bearer "+token

}

}

);




const data =
await res.json();





if(data.success){


data.messages.forEach(

showMessage

);


await fetch(

API+
"/api/messages/read/"+
chatId,

{

method:"POST",

headers:{

Authorization:

"Bearer "+token

}

}

);


}



}








async function sendMessage(){



const text =
input.value.trim();



if(!text)
return;




input.value="";





await fetch(

API+
"/api/messages/send",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
"Bearer "+token

},


body:JSON.stringify({

chatId,

text

})


}

);


}







send.onclick =
sendMessage;



input.addEventListener(

"keydown",

(e)=>{


if(e.key==="Enter"){

sendMessage();

}


}

);








const socket =
io(API);



socket.emit(

"joinChat",

chatId

);






socket.on(

"new_message",

(msg)=>{


showMessage(msg);



}

);







loadMessages();
