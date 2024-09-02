const mongoose = require("mongoose");

const jobPostingSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  salary: Number,
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  interestedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);

module.exports = JobPosting;
