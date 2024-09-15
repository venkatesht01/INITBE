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
    const {
      email,
      password,
      role,
      address1,
      address2,
      brp,
      companyName,
      companyNumber,
      country,
      employeeId,
      firstName,
      lastName,
      passport,
      phone,
      postcode,
      town,
    } = req.body;
    const username = firstName;

    console.log(
      email,
      password,
      role,
      address1,
      address2,
      brp,
      companyName,
      companyNumber,
      country,
      employeeId,
      firstName,
      lastName,
      passport,
      phone,
      postcode,
      town
    );

    // Check for required fields
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Username, email, password, and role are required." });
    }
    console.log(1);

    // Validate role
    if (!["employee", "employer"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Only 'employee' or 'employer' roles are allowed.",
      });
    }
    console.log(2);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(400).json({
          error: "Please verify your email before registering again.",
        });
      }
      return res.status(400).json({ error: "User already exists" });
    }
    console.log(3);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // Expires in 1 hour

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: role === "employee", // Automatically activate employees
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      address1: address1 || "",
      address2: address2 || "",
      brp: brp || "",
      companyName: companyName || "",
      companyNumber: companyNumber || "",
      country: country || "",
      email: email || "",
      employeeId: employeeId || "",
      firstName: firstName || "",
      lastName: lastName || "",
      passport: passport || "",
      phone: phone || "",
      postcode: postcode || "",
      role: role || "employee",
      town: town || "",
    });

    // Save the new user to the database
    await newUser.save();
    console.log(4);

    // Send verification email
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: "initproject461@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Please click the link below to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    // Respond to client
    res.status(200).json({
      message: `User registered successfully. A verification email has been sent to ${email}.`,
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ error: "Server Error" });
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
