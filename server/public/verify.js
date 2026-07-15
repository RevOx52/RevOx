const API = "http://127.0.0.1:8081";

const button = document.getElementById("verify");
const status = document.getElementById("status");


button.onclick = async () => {

    const code = document.getElementById("code").value.trim();

    const email = localStorage.getItem("email");


    if (!code || code.length !== 6) {

        status.innerText = "Введите 6 цифр";

        return;

    }


    status.innerText = "Проверяем код...";


    try {


        const response = await fetch(API + "/api/auth/verify-code", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email: email,

                code: code

            })

        });


        const data = await response.json();


        if (data.success) {


            window.location.href = "home.html";


        } else {


            status.innerText = data.message || "Неверный код";


        }



    } catch(error) {


        console.log(error);

        status.innerText = "Сервер недоступен";


    }


};
