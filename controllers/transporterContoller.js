const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  service: "Gmail", // or any other email service you use
  auth: {
    user: process.env.ACCOUNT_USERID,
    pass: process.env.ACCOUNT_PASSWORD,
  },
});

module.exports = transporter;
