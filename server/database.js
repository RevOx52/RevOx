const { execFile } = require("child_process");

const db = "users.db";


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

                try {
                    resolve(JSON.parse(stdout || "[]"));
                } catch {
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

                if(error)
                    reject(error);
                else
                    resolve(true);

            }
        );

    });

}


module.exports = {
    query,
    run
};
