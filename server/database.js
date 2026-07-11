const initSqlJs = require("sql.js");
const fs = require("fs");


let db;



async function initDatabase(){


    const SQL = await initSqlJs();



    if(fs.existsSync("./database/users.sqlite")){


        const file =
        fs.readFileSync("./database/users.sqlite");


        db =
        new SQL.Database(file);



    } else {



        db =
        new SQL.Database();



        db.run(`

        CREATE TABLE users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            email TEXT UNIQUE NOT NULL,

            first_name TEXT,

            last_name TEXT,

            password TEXT,

            created_at TEXT

        );

        `);



        saveDatabase();

    }



    console.log("Database loaded");

}




function saveDatabase(){


    const data =
    db.export();


    fs.writeFileSync(

        "./database/users.sqlite",

        Buffer.from(data)

    );


}





function getDB(){

    return db;

}





module.exports = {

    initDatabase,

    getDB,

    saveDatabase

};
