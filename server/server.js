require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: process.env.APP_NAME || "RevOx",
    version: "0.1",
    status: "online"
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`${process.env.APP_NAME || "RevOx"} server started on port ${PORT}`);
});
