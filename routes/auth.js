const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
} = require("../controllers/userController");

// Register Route
router.post("/register", register);

// Login Route
router.post("/login", login);

// Verify Email Route
router.get("/verify-email", verifyEmail);

module.exports = router;
