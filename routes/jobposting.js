const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const jobPosting = require("../controllers/jobpostingController");

router.post(
  "/create",
  authMiddleware(["employer"]),
  jobPosting.createJobPosting
);

router.get("/", authMiddleware(["employer"]), jobPosting.jobpostinglist);
router.post(
  "/expressInterest",
  authMiddleware(["employee"]),
  jobPosting.expressInterest
);
router.get(
  "/interested/:jobId",
  authMiddleware(["employer"]),
  jobPosting.getInterestedEmployees
);

module.exports = router;
