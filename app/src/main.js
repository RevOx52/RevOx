import {

initPush

} from "./push.js";





document.addEventListener(

"DOMContentLoaded",

async()=>{



try{



await initPush();



console.log(

"RevOx Push started"

);



}catch(error){



console.log(

"Push start error",

error

);



}



});
