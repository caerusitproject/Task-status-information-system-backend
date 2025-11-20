const express = require("express");
const router = express.Router();
const { getStartAndEndOfMonth } = require("../util/modifiers");
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ReportInfoService = require("../services/reportService");
const ReportController = require("../controllers/reportController");

router.post("/create", ReportController.createReport);

router.get("/view", ReportController.viewReport);

router.get("/generatePDFreport", ReportController.createPdfTimeSheetReport);

module.exports = router;
