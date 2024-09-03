const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
} = require("../controllers/userController");

router.post("/register", register);

router.post("/login", login);

router.get("/verify-email", verifyEmail);

module.exports = router;
