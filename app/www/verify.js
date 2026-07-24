const API = "https://revox-yuyn.onrender.com";


const inputs =
document.querySelectorAll(".code-input");


const button =
document.getElementById("verify");


const status =
document.getElementById("status");





// Автопереход между клетками

inputs.forEach((input,index)=>{


    input.addEventListener(
        "input",
        ()=>{


            input.value =
            input.value.replace(
                /[^0-9]/g,
                ""
            );


            if(
                input.value &&
                index < inputs.length - 1
            ){

                inputs[index+1].focus();

            }


        }
    );





    input.addEventListener(
        "keydown",
        (e)=>{


            if(
                e.key === "Backspace" &&
                !input.value &&
                index > 0
            ){

                inputs[index-1].focus();

            }


        }
    );


});







button.onclick = async()=>{


    let code = "";


    inputs.forEach(input=>{

        code += input.value;

    });





    const email =
    localStorage.getItem("email");




    if(code.length !== 6){


        status.innerText =
        "Введите 6 цифр";


        return;


    }




    status.innerText =
    "Проверяем...";





    try{


        const response =
        await fetch(

            API + "/api/auth/verify",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify({

                    email,

                    code

                })


            }

        );





        const data =
        await response.json();





        if(data.success){


            status.innerText =
            "Код подтверждён";


            setTimeout(()=>{


                location.href =
                "password.html";


            },500);



        }else{


            status.innerText =
            data.message || "Неверный код";


        }





    }catch(error){


        console.log(error);


        status.innerText =
        "Ошибка сервера";


    }


};
