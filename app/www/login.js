const API = "https://revox-yuyn.onrender.com";


const button =
document.getElementById("login");


const status =
document.getElementById("status");



button.onclick = async()=>{


    const email =
    localStorage.getItem("email");



    const password =
    document.getElementById("password").value;





    if(!password){


        status.innerText =
        "Введите пароль";


        return;

    }




    status.innerText =
    "Входим...";





    try{


        const response =
        await fetch(

            API + "/api/auth/login",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    email,

                    password

                })

            }

        );





        const data =
        await response.json();





        if(data.success){



            localStorage.setItem(

                "token",

                data.token

            );



            localStorage.setItem(

                "refreshToken",

                data.refreshToken

            );





            if(data.user){


                localStorage.setItem(

                    "user",

                    JSON.stringify(data.user)

                );


            }





            status.innerText =
            "Успешный вход";



            window.location.href =
            "home.html";





        }else{


            status.innerText =
            data.message ||
            "Ошибка входа";


        }





    }catch(error){


        console.log(error);


        status.innerText =
        "Ошибка сервера";


    }



};

