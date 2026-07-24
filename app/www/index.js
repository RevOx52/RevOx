const API = "https://revox-yuyn.onrender.com";


const button =
document.getElementById("continue");


const status =
document.getElementById("status");



button.onclick = async()=>{


    const email =
    document.getElementById("email").value.trim();



    if(!email){


        status.innerText =
        "Введите email";


        return;

    }




    status.innerText =
    "Проверяем аккаунт...";





    try{


        const response =
        await fetch(

            API + "/api/auth/check",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    email

                })

            }

        );





        const data =
        await response.json();





        localStorage.setItem(
            "email",
            email
        );






        if(data.exists){



            // Аккаунт уже есть

            status.innerText =
            "Аккаунт найден";



            window.location.href =
            "login.html";




        }else{



            // Новый пользователь

            status.innerText =
            "Создаём аккаунт";



            window.location.href =
            "verify.html";



        }





    }catch(error){


        console.log(error);



        status.innerText =
        "Ошибка сервера";


    }



};

