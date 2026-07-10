console.log("INDEX JS LOADED");


const button = document.getElementById("continue");
const status = document.getElementById("status");


button.onclick = async()=>{


    const email =
    document.getElementById("email").value.trim();



    if(!email){

        status.innerText =
        "Введите email";

        return;
    }



    if(!email.includes("@")){

        status.innerText =
        "Неверный email";

        return;
    }



    status.innerText =
    "Проверяем email...";



    try{


        // Проверяем существует ли пользователь

        const check =
        await fetch("/api/auth/check",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email
            })

        });



        const data =
        await check.json();



        localStorage.setItem(
            "email",
            email
        );



        if(data.exists){


            // пользователь есть

            location.href =
            "login.html";


        }else{


            // новый пользователь
            // отправляем код


            status.innerText =
            "Отправляем код...";



            const send =
            await fetch("/api/auth/register",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    email
                })

            });



            const sendData =
            await send.json();



            if(sendData.success){


                location.href =
                "verify.html";


            }else{


                status.innerText =
                sendData.message ||
                "Ошибка отправки";


            }


        }



    }catch(error){


        console.log(error);


        status.innerText =
        "Ошибка сервера";


    }


};
