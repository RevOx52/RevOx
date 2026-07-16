const API = "https://revox-yuyn.onrender.com";


const button = document.getElementById("continue");
const status = document.getElementById("status");


button.onclick = async () => {

    const email = document.getElementById("email").value.trim();

    if (!email) {
        status.innerText = "Введите email";
        return;
    }

    localStorage.setItem("email", email);

    status.innerText = "Отправляем код...";

    try {

        const response = await fetch(
            API + "/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            window.location.href = "verify.html";

        } else {

            status.innerText = data.message || "Ошибка";

        }

    } catch(error) {

        console.log(error);
        status.innerText = "Ошибка сервера";

    }

};
