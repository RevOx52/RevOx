const { execFile } = require("child_process");

const db = "users.db";



function exec(sql){

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








async function init(){



await exec(`


CREATE TABLE IF NOT EXISTS users(

id INTEGER PRIMARY KEY AUTOINCREMENT,

email TEXT UNIQUE NOT NULL,

username TEXT UNIQUE,

first_name TEXT,

last_name TEXT,

avatar TEXT,

password TEXT,

push_token TEXT,

created_at TEXT

);



CREATE TABLE IF NOT EXISTS chats(

id INTEGER PRIMARY KEY AUTOINCREMENT,

created_at TEXT

);



CREATE TABLE IF NOT EXISTS chat_members(

id INTEGER PRIMARY KEY AUTOINCREMENT,

chat_id INTEGER,

user_id INTEGER,

last_read INTEGER DEFAULT 0

);



CREATE TABLE IF NOT EXISTS messages(

id INTEGER PRIMARY KEY AUTOINCREMENT,

chat_id INTEGER,

sender_id INTEGER,

text TEXT,

created_at TEXT,

read INTEGER DEFAULT 0

);



`);






// добавляем колонку старым пользователям

try{


await exec(`

ALTER TABLE users

ADD COLUMN push_token TEXT;

`);


}catch(e){



// колонка уже существует

}




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


return exec(sql);


}








module.exports={

init,

query,

run

};
