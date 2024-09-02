const bcrypt = require("bcrypt");
const User = require("../models/User");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Define your JWT secret key and expiration time
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXP; // 1 hour expiration time

const transporter = require("./transporterContoller");

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    // Validate role
    if (!["employee", "employer"].includes(role)) {
      return res
        .status(400)
        .send("Invalid role. Only employee or employer allowed.");
    }

    // Check if the user already exists and is pending verification
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res
          .status(400)
          .send("Please verify your email before registering again.");
      }
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiration

    // Create a new user in pending state
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: role === "employee", // Employers need admin approval
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Save the user to the database
    await newUser.save();

    // Send verification email
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: "initproject461@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Please click the link below to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    // Respond to the client
    res
      .status(201)
      .send(
        `User registered successfully. A verification email has been sent to ${email}.`
      );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Verify Email Endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Find user by verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    // Update user to set verified and activate the account
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    user.verificationTokenExpires = undefined;

    // For employers, send a message that admin approval is required
    if (user.role === "employer") {
      await user.save();
      return res
        .status(200)
        .send("Email verified successfully. Awaiting admin approval.");
    }

    // Activate if the role is employee
    user.isActive = true;
    await user.save();

    res.status(200).send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Login Endpoint
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists by email
    const user = await User.findOne({ email });

    // Check if the user exists and is verified
    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .send("Please verify your email before logging in.");
    }

    // If the user is an employer, check if the account is active (approved by admin)
    if (user.role === "employer" && !user.isActive) {
      return res
        .status(400)
        .send("Your account is pending approval by the admin.");
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    // Generate JWT token with user role and ID
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload includes user ID and role
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Respond with the token and success message
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
