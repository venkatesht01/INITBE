const JobPosting = require("../models/JobPosing");
exports.createJobPosting = async (req, res) => {
  try {
    const { title, description, location, salary } = req.body;
    const jobPosting = new JobPosting({
      title,
      description,
      location,
      salary,
      employer: req.user.userId,
    });
    await jobPosting.save();
    res.status(201).send(jobPosting);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.jobpostinglist = async (req, res) => {
  const jobs = await JobPosting.find();
  res.status(200).json({ data: jobs });
};

exports.expressInterest = async (req, res) => {
  try {
    const { jobId } = req.body;
    const employeeId = req.user.userId;

    const jobPosting = await JobPosting.findById(jobId);

    if (!jobPosting) {
      return res.status(404).send("Job posting not found");
    }

    if (jobPosting.interestedEmployees.includes(employeeId)) {
      return res
        .status(400)
        .send("You have already expressed interest in this job");
    }

    jobPosting.interestedEmployees.push(employeeId);

    await jobPosting.save();

    res.status(200).send("Interest expressed successfully");
  } catch (error) {
    console.error("Error expressing interest:", error);
    res.status(500).send("Server error");
  }
};

exports.getInterestedEmployees = async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobPosting = await JobPosting.findById(jobId).populate(
      "interestedEmployees",
      "username email"
    );

    if (!jobPosting) {
      return res.status(404).send("Job posting not found");
    }

    res
      .status(200)
      .json({ interestedEmployees: jobPosting.interestedEmployees });
  } catch (error) {
    console.error("Error fetching interested employees:", error);
    res.status(500).send("Server error");
  }
};
