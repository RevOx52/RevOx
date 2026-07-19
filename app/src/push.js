import {

PushNotifications

} from "@capacitor/push-notifications";



const API =

"https://revox-yuyn.onrender.com";



const token =

localStorage.getItem("token");








export async function initPush(){



try{



let permission =

await PushNotifications.requestPermissions();





if(permission.receive !== "granted"){


console.log(

"Push permission denied"

);


return;


}







await PushNotifications.register();









PushNotifications.addListener(

"registration",

async(data)=>{



console.log(

"FCM TOKEN:",

data.value

);




await saveToken(

data.value

);



}

);







PushNotifications.addListener(

"registrationError",

(error)=>{


console.log(

"Push error",

error

);


}

);






PushNotifications.addListener(

"pushNotificationReceived",

(notification)=>{



console.log(

"New notification",

notification

);



}

);






PushNotifications.addListener(

"pushNotificationActionPerformed",

(action)=>{



console.log(

"Notification click",

action

);



}

);







}catch(error){



console.log(

"Push init error",

error

);



}



}









async function saveToken(fcmToken){



if(!token)
return;





try{



await fetch(

API+

"/api/user/push-token",

{

method:"POST",


headers:{


"Content-Type":

"application/json",


Authorization:

"Bearer "+token


},


body:JSON.stringify({

token:fcmToken

})


}

);





}catch(e){



console.log(e);


}



}
