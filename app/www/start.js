const API =
"https://revox-yuyn.onrender.com";



const button =
document.getElementById("continue");



const status =
document.getElementById("status");






button.onclick = async()=>{



    const firstName =
    document
    .getElementById("firstName")
    .value
    .trim();



    const lastName =
    document
    .getElementById("lastName")
    .value
    .trim();



    const username =
    document
    .getElementById("username")
    .value
    .trim()
    .toLowerCase();



    const email =
    document
    .getElementById("email")
    .value
    .trim();





    if(
        !firstName ||
        !lastName ||
        !username ||
        !email
    ){


        status.innerText =
        "Заполните все поля";


        return;


    }





    if(username.length < 3){


        status.innerText =
        "Username минимум 3 символа";


        return;


    }





    if(
        !/^[a-z0-9_]+$/.test(username)
    ){


        status.innerText =
        "Только a-z, 0-9 и _";


        return;


    }







    status.innerText =
    "Проверяем...";






    try{


        const check =
        await fetch(

            API +
            "/api/user/search?q=" +
            username

        );



        const users =
        await check.json();





        const exists =
        users.users?.some(

            u =>
            u.username === username

        );





        if(exists){


            status.innerText =
            "Username занят";


            return;


        }







        localStorage.setItem(
            "firstName",
            firstName
        );


        localStorage.setItem(
            "lastName",
            lastName
        );


        localStorage.setItem(
            "username",
            username
        );


        localStorage.setItem(
            "email",
            email
        );






        status.innerText =
        "Отправляем код...";






        const response =
        await fetch(

            API +
            "/api/auth/register",

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






        if(data.success){


            window.location.href =
            "verify.html";


        }else{


            status.innerText =
            data.message ||
            "Ошибка";


        }






    }catch(error){


        console.log(error);


        status.innerText =
        "Ошибка сервера";


    }



};
