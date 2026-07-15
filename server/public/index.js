const API = "http://127.0.0.1:8080";

const button = document.getElementById("continue");
const status = document.getElementById("status");


button.onclick = async () => {

    const email = document
        .getElementById("email")
        .value
        .trim();


    if(!email){

        status.innerText = "Введите email";

        return;

    }


    status.innerText = "Отправляем код...";


    try {

        const response = await fetch(
            API + "/api/auth/register",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:email
                })
            }
        );


        const data = await response.json();


        if(data.success){

            localStorage.setItem(
                "email",
                email
            );


            location.href="verify.html";


        } else {

            status.innerText =
            data.message || "Ошибка";

        }


    } catch(error){

        console.log(error);

        status.innerText =
        "Сервер недоступен";

    }

};
