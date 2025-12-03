const express = require("express");
const router = express.Router();
const { getStartAndEndOfMonth } = require("../util/modifiers");
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ReportInfoService = require("../services/reportService");
const ReportController = require("../controllers/reportController");

router.post("/create", ReportController.createReport);

router.get("/view", ReportController.viewReport);

router.post(
  "/generateExcelReport",
  ReportController.createExcelTimeSheetReport
);

router.post("/generatePDFReport", ReportController.createPDFTimeSheetReport);

router.post(
  "/generatePDFReportTask",
  ReportController.createPDFTaskSheetReport
);

router.post(
  "/generateExcelReportTask",
  ReportController.createExcelTaskSheetReport
);

module.exports = router;
