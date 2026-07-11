const inputs = document.querySelectorAll(".code");

const button = document.getElementById("verify");
const status = document.getElementById("status");

const email = localStorage.getItem("email");


inputs.forEach((input,index)=>{

    input.addEventListener("input",()=>{

        if(input.value && index < inputs.length-1){

            inputs[index+1].focus();

        }

    });


    input.addEventListener("keydown",(e)=>{

        if(e.key === "Backspace" && !input.value && index > 0){

            inputs[index-1].focus();

        }

    });


    input.addEventListener("input",()=>{

        input.value =
        input.value.replace(/[^0-9]/g,"");

    });

});



button.onclick = async()=>{


    let code = "";

    inputs.forEach(input=>{

        code += input.value;

    });



    if(code.length !== 6){

        status.innerText =
        "Введите весь код";

        return;

    }



    status.innerText =
    "Проверяем...";



    try{


        const res =
        await fetch("/api/auth/verify",
        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email,

                code

            })

        });



        const data =
        await res.json();



        if(data.success){


            location.href =
            "profile.html";


        }else{


            status.innerText =
            data.message;


        }



    }catch(error){


        status.innerText =
        "Ошибка сервера";


    }


};
