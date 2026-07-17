const token = localStorage.getItem("token");
const email = localStorage.getItem("email");


// Проверка авторизации

if (!token) {

    window.location.href = "index.html";

}



// Навигация

const navButtons =
document.querySelectorAll(".nav button");



navButtons.forEach(button => {


    button.addEventListener("click", ()=>{


        const page =
        button.dataset.page;



        switch(page){


            case "chats":

                showMessage(
                    "Чаты"
                );

                break;



            case "contacts":

                showMessage(
                    "Контакты"
                );

                break;



            case "news":

                showMessage(
                    "Новости RevOx"
                );

                break;



            case "profile":

                showMessage(
                    email || "Профиль"
                );

                break;


        }


    });


});





function showMessage(text){


    const title =
    document.querySelector(".empty h2");


    const description =
    document.querySelector(".empty p");



    if(title){

        title.innerText = text;

    }



    if(description){

        description.innerText =
        "Раздел в разработке";

    }


}






// Кнопка создания чата

const addChat =
document.getElementById("addChat");



if(addChat){


    addChat.addEventListener(
        "click",
        ()=>{


            showMessage(
                "Новый чат"
            );


        }
    );


}






// Поиск

const searchBtn =
document.getElementById("searchBtn");



if(searchBtn){


    searchBtn.addEventListener(
        "click",
        ()=>{


            showMessage(
                "Поиск"
            );


        }
    );


}






// Настройки

const settingsBtn =
document.getElementById("settingsBtn");



if(settingsBtn){


    settingsBtn.addEventListener(
        "click",
        ()=>{


            showMessage(
                "Настройки"
            );


        }
    );


}
