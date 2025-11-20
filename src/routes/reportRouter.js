const express = require("express");
const router = express.Router();
const { getStartAndEndOfMonth } = require("../util/modifiers");
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ReportInfoService = require("../services/reportService");
const ReportController = require("../controllers/reportController");

router.post("/create", ReportController.createReport);

router.get("/view", ReportController.viewReport);

// router.put("/edit/:ticketId", async (req, res, next) => {
//   try {
//     const newStatusInfo = await TicketStatusInfoService.editTicketStatusInfo(req.params,req.body);
//     res.status(newStatusInfo.status).json({
//         message:newStatusInfo.message,status:newStatusInfo.status
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;
