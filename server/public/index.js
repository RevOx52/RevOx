const API = "http://192.168.8.38:8080";

const button = document.getElementById("continue");
const status = document.getElementById("status");

button.onclick = async () => {

    status.innerText = "Проверяем сервер...";

    try {

        const response = await fetch(API);

        const text = await response.text();

        status.innerText = 
            "Ответ сервера:\n" + text;

        console.log("SERVER:", text);

    } catch(error) {

        console.log("FETCH ERROR:", error);

        status.innerText =
            "Ошибка: " + error.message;

    }

};
