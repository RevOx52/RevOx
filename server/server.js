const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: "RevOx",
    version: "0.1",
    status: "online"
  });
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`RevOx server started on port ${PORT}`);
});
