import {

Camera,

CameraResultType,

CameraSource

} from "@capacitor/camera";





export async function selectAvatar(){


try{



const permission =

await Camera.requestPermissions();





if(

permission.camera !== "granted" &&

permission.photos !== "granted"

){


alert(

"Разрешение на фото необходимо"

);


return null;


}







const photo =

await Camera.getPhoto({


quality:90,


allowEditing:true,


width:512,


height:512,


resultType:

CameraResultType.DataUrl,



source:

CameraSource.Prompt


});







return photo.dataUrl;






}catch(error){



console.log(

"Camera error:",

error

);



return null;


}



}
