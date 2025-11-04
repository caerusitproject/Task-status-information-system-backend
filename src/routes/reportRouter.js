const express = require("express");
const router = express.Router();
const { getStartAndEndOfMonth } = require('../util/modifiers')
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const ReportInfoService = require("../services/reportService");

router.post("/view", async (req, res, next) => {
  try {
    const { year, month } = req.body;
    const {startDate,endDate}= getStartAndEndOfMonth(year,month)
    const reportInfo = await ReportInfoService.viewReportStatus(startDate,endDate);
    res.status(reportInfo.status).json({message: reportInfo.message, status: reportInfo.status, content:reportInfo.content});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.get("/view", async (req, res, next) => {
//   try {
//     const newStatusInfo = await TicketStatusInfoService.getTicketStatusInfo(req.query);
//     res.status(newStatusInfo.status).json({
//       count: newStatusInfo.totalRecords,
//       rows: newStatusInfo.rows,
//       totalPages: newStatusInfo.totalPages,
//       currentPage: newStatusInfo.currentPage,
//       nextPage:newStatusInfo.nextPage,
//       previousPage:newStatusInfo.previousPage,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


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