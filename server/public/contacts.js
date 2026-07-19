const API =
"https://revox-yuyn.onrender.com";


const token =
localStorage.getItem("token");



const search =
document.getElementById("search");


const users =
document.getElementById("users");




let timer = null;





search.addEventListener(

"input",

()=>{


clearTimeout(timer);



timer = setTimeout(

searchUsers,

400

);



}

);









async function searchUsers(){



const text =
search.value.trim();




users.innerHTML = "";





if(!text)
return;







try{



const res =
await fetch(

API+
"/api/user/search?q="+

encodeURIComponent(text),

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







if(data.users.length===0){



users.innerHTML = `

<div class="empty">

Пользователь не найден

</div>

`;



return;


}







data.users.forEach(user=>{



const item =
document.createElement("div");



item.className =
"user";






const letter =

(

user.first_name

?

user.first_name[0]

:

"?"

)

.toUpperCase();






item.innerHTML = `


<div class="avatar">


${
user.avatar

?

`<img src="${user.avatar}">`

:

letter

}


</div>



<div class="info">


<h3>

${user.first_name || ""}

${user.last_name || ""}

</h3>


<p>

@${user.username || "user"}

</p>


</div>



<button>

Написать

</button>


`;







item
.querySelector("button")
.onclick = ()=>{


createChat(user.id);


};







users.appendChild(item);



});







}catch(error){


console.log(error);



}



}









async function createChat(userId){



try{



const res =
await fetch(

API+
"/api/chats/create",

{

method:"POST",

headers:{

"Content-Type":

"application/json",


Authorization:

"Bearer "+token

},


body:JSON.stringify({

userId

})


}

);







const data =
await res.json();







if(data.success){


location.href =

"chat.html?id="+data.chat_id;


}






}catch(error){


console.log(error);


}



}
