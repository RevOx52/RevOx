const token = localStorage.getItem("token");

const email = localStorage.getItem("email");


if (!token) {

    window.location.href = "index.html";

}


const emailElement =
document.getElementById("email");


if (emailElement && email) {

    emailElement.innerText = email;

}
