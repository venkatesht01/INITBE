const bcrypt = require("bcrypt");
const User = require("../models/User");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXP;

const transporter = require("./transporterContoller");

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    if (!["employee", "employer"].includes(role)) {
      return res
        .status(400)
        .send("Invalid role. Only employee or employer allowed.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res
          .status(400)
          .send("Please verify your email before registering again.");
      }
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: role === "employee",
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save();

    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: "initproject461@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Please click the link below to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
    });

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

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    if (user.role === "employer") {
      await user.save();
      return res
        .status(200)
        .send("Email verified successfully. Awaiting admin approval.");
    }

    user.isActive = true;
    await user.save();

    res.status(200).send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .send("Please verify your email before logging in.");
    }

    if (user.role === "employer" && !user.isActive) {
      return res
        .status(400)
        .send("Your account is pending approval by the admin.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
