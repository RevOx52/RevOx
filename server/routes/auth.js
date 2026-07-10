const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email required"
    });
  }

  res.json({
    success: true,
    message: "Registration started",
    email
  });

});

module.exports = router;
