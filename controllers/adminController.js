const User = require("../models/User");
const transporter = require("./transporterContoller");
exports.approveEmployer = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== "employer") {
      return res.status(404).send("Employer not found");
    }
    user.isActive = true;
    await user.save();
    await transporter.sendMail({
      from: "initproject461@gmail.com",
      to: user.email,
      subject: "Account Approved",
      html: `<p>Your account has been approved by the admin. You can now log in.</p>`,
    });

    res.status(200).send("Employer approved successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.rejectEmployer = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== "employer") {
      return res.status(404).send("Employer not found");
    }
    await User.findByIdAndDelete(userId);
    await transporter.sendMail({
      from: "initproject461@gmail.com",
      to: user.email,
      subject: "Account Rejected",
      html: `<p>Your account has been rejected by the admin. Please contact support for further information.</p>`,
    });
    res.status(200).send("Employer rejected and removed successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.approvalList = async (req, res) => {
  const users = await User.find({ isActive: false, role: "employer" });
  res.status(200).json({ data: users });
};
