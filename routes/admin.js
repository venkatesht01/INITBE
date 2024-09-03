const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.put(
  "/approve-employer/:userId",
  authMiddleware(["Admin"]),
  adminController.approveEmployer
);
router.delete(
  "/reject-employer/:userId",
  authMiddleware(["Admin"]),
  adminController.rejectEmployer
);

router.get(
  "/approval-list",
  authMiddleware(["Admin"]),
  adminController.approvalList
);

module.exports = router;
