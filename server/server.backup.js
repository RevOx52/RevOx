const express = require("express");
const cors = require("cors");
require("dotenv").config();


const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");


const app = express();


app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{

    res.json({
        app:"RevOx",
        status:"online"
    });

});


app.use("/api/auth", authRoute);

app.use("/api/user", userRoute);


const PORT = process.env.PORT || 8080;


app.listen(PORT,"0.0.0.0",()=>{

    console.log(`RevOx server running on ${PORT}`);

});
