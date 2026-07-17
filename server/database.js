const { execFile } = require("child_process");

const db = "users.db";


// Создание таблицы при запуске

function init(){

    return new Promise((resolve,reject)=>{

        const sql = `
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            email TEXT UNIQUE,

            first_name TEXT,

            last_name TEXT,

            password TEXT,

            created_at TEXT

        );
        `;


        execFile(
            "sqlite3",
            [
                db,
                sql
            ],
            (error)=>{

                if(error){
                    console.log("DATABASE INIT ERROR:");
                    console.log(error);
                    reject(error);
                    return;
                }


                console.log("Database ready");

                resolve(true);

            }
        );

    });

}



function query(sql){

    return new Promise((resolve,reject)=>{

        execFile(
            "sqlite3",
            [
                "-json",
                db,
                sql
            ],
            (error,stdout)=>{

                if(error){
                    reject(error);
                    return;
                }


                try{

                    resolve(
                        JSON.parse(stdout || "[]")
                    );

                }catch{

                    resolve([]);

                }

            }
        );

    });

}



function run(sql){

    return new Promise((resolve,reject)=>{

        execFile(
            "sqlite3",
            [
                db,
                sql
            ],
            (error)=>{

                if(error){

                    reject(error);

                }else{

                    resolve(true);

                }

            }
        );

    });

}



module.exports = {

    query,

    run,

    init

};
