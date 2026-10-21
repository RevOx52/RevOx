const API = "https://revox-yuyn.onrender.com";

const button = document.getElementById("continue");
const status = document.getElementById("status");

function showError(message) {
    status.innerText = message;
    console.error("[RevOx]", message);
}

async function readResponse(response, stage) {
    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        const details =
            `HTTP ${response.status}: сервер вернул не JSON`;

        console.error(`[${stage}] JSON_PARSE_ERROR`, {
            httpStatus: response.status,
            contentType: response.headers.get("content-type"),
            responseBody: text.slice(0, 500)
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} — ${details} (JSON_PARSE_ERROR)`
            );
        }

        throw new Error(
            `JSON_PARSE_ERROR — ${details}`
        );
    }

    if (!response.ok) {
        const message =
            data.message ||
            data.error ||
            response.statusText ||
            "Неизвестная ошибка";

        console.error(`[${stage}] HTTP_ERROR`, {
            status: response.status,
            data
        });

        throw new Error(
            `HTTP ${response.status} — ${message}`
        );
    }

    return data;
}

function getErrorMessage(error) {
    const message = error?.message || String(error);

    if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("Load failed")
    ) {
        return "NETWORK_ERROR — нет соединения с сервером";
    }

    return message;
}

button.onclick = async () => {
    const firstName = document
        .getElementById("firstName")
        .value.trim();

    const lastName = document
        .getElementById("lastName")
        .value.trim();

    const username = document
        .getElementById("username")
        .value.trim()
        .toLowerCase();

    const email = document
        .getElementById("email")
        .value.trim();

    if (!firstName || !lastName || !username || !email) {
        status.innerText = "Заполните все поля";
        return;
    }

    if (username.length < 3) {
        status.innerText = "Username минимум 3 символа";
        return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
        status.innerText = "Только a-z, 0-9 и _";
        return;
    }

    button.disabled = true;
    status.innerText = "Проверяем username...";

    try {
        const check = await fetch(
            API + "/api/user/search?q=" +
            encodeURIComponent(username)
        );

        const users = await readResponse(check, "USERNAME_SEARCH");

        const exists = users.users?.some(
            user => user.username === username
        );

        if (exists) {
            status.innerText = "Username занят";
            return;
        }

        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);

        status.innerText = "Отправляем код...";

        const response = await fetch(
            API + "/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            }
        );

        const data = await readResponse(response, "REGISTER");

        if (data.success) {
            window.location.href = "verify.html";
        } else {
            showError(
                "REGISTER_ERROR — " +
                (data.message || data.error || "Сервер отклонил регистрацию")
            );
        }
    } catch (error) {
        console.error("[RevOx] Registration failed:", error);
        showError(getErrorMessage(error));
    } finally {
        button.disabled = false;
    }
};
