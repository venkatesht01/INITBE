const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "employee", "employer"],
    required: true,
  },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },

  // Profile Details (now directly within userSchema)
  address1: { type: String, default: "" },
  address2: { type: String, default: "" },
  brp: { type: String, default: "" },
  companyName: { type: String, default: "" },
  companyNumber: { type: String, default: "" },
  country: { type: String, default: "" },
  employeeId: { type: String, default: "" },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  passport: { type: String, default: "" },
  phone: { type: String, default: "" },
  postcode: { type: String, default: "" },
  town: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
