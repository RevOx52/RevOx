const button =
document.getElementById("continue");


const status =
document.getElementById("status");


const avatarInput =
document.getElementById("avatar");


const avatarPreview =
document.getElementById("avatarPreview");


const avatarLetter =
document.getElementById("avatarLetter");



let avatarData = "";




// Обновление буквы

function updateLetter(){


    const name =
    document.getElementById("firstName").value.trim();



    if(name){


        avatarLetter.innerText =
        name[0].toUpperCase();


    }else{


        avatarLetter.innerText =
        "?";


    }


}





document
.getElementById("firstName")
.addEventListener(
    "input",
    updateLetter
);






// Выбор фото


avatarInput.addEventListener(
"change",
()=>{


    const file =
    avatarInput.files[0];



    if(!file)
        return;



    const reader =
    new FileReader();



    reader.onload = ()=>{


        avatarData =
        reader.result;



        avatarPreview.src =
        avatarData;



        avatarPreview.style.display =
        "block";



        avatarLetter.style.display =
        "none";


    };



    reader.readAsDataURL(file);



});







// Сохранение


button.onclick = ()=>{


    const firstName =
    document
    .getElementById("firstName")
    .value
    .trim();



    const lastName =
    document
    .getElementById("lastName")
    .value
    .trim();





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





    if(avatarData){


        localStorage.setItem(
            "avatar",
            avatarData
        );


    }else{


        localStorage.removeItem(
            "avatar"
        );


    }





    location.href =
    "password.html";



};
