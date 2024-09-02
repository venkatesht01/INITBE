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
    console.log(jobId);
    const employeeId = req.user.userId; // Assuming req.userId is set after authentication

    // Find the job posting by ID
    const jobPosting = await JobPosting.findById(jobId);

    if (!jobPosting) {
      return res.status(404).send("Job posting not found");
    }

    // Check if the employee is already interested
    if (jobPosting.interestedEmployees.includes(employeeId)) {
      return res
        .status(400)
        .send("You have already expressed interest in this job");
    }

    // Add the employee ID to the interestedEmployees array
    jobPosting.interestedEmployees.push(employeeId);

    // Save the updated job posting
    await jobPosting.save();

    res.status(200).send("Interest expressed successfully");
  } catch (error) {
    console.error("Error expressing interest:", error);
    res.status(500).send("Server error");
  }
};

// Endpoint to get interested employees for a job posting
exports.getInterestedEmployees = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(jobId);

    // Find the job posting and populate the interested employees field
    const jobPosting = await JobPosting.findById(jobId).populate(
      "interestedEmployees",
      "username email" // Select fields to show, e.g., username and email
    );

    if (!jobPosting) {
      return res.status(404).send("Job posting not found");
    }

    // Respond with the list of interested employees
    res
      .status(200)
      .json({ interestedEmployees: jobPosting.interestedEmployees });
  } catch (error) {
    console.error("Error fetching interested employees:", error);
    res.status(500).send("Server error");
  }
};
