import {
    LocalNotifications
} from "@capacitor/local-notifications";



let openedChat = null;



export function setOpenedChat(id){

    openedChat =
    String(id);

}







export async function initNotifications(){



const permission =
await LocalNotifications.requestPermissions();



if(permission.display !== "granted"){

console.log(
"Notifications denied"
);

return;

}






await LocalNotifications.createActionTypes({

types:[

{

id:"MESSAGE_ACTIONS",

actions:[


{

id:"read",

title:"Прочитано"


},



{

id:"reply",

title:"Ответить",

input:true


}



]

}

]

});









LocalNotifications.addListener(

"localNotificationActionPerformed",

async(event)=>{


const action =
event.actionId;



const chatId =
event.notification.extra?.chatId;






if(action==="read"){


console.log(
"Message read",
chatId
);


}






if(action==="reply"){


const text =
event.inputValue;



if(text){


console.log(

"Reply:",

text

);


// тут отправка ответа через API

}



}






if(chatId){


window.location.href =
"chat.html?id="+chatId;


}



}

);



}









export async function showMessageNotification(message){



if(

String(openedChat)

===

String(message.chat_id)

)

return;








await LocalNotifications.schedule({

notifications:[

{

id:

Number(message.id),



title:

"RevOx",



body:

message.text,



actionTypeId:

"MESSAGE_ACTIONS",



extra:{

chatId:

message.chat_id

}



}

]

});



}
