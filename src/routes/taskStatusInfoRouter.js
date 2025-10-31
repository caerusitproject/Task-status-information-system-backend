const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const TicketStatusInfoService = require("../services/taskStatusInfoService");

router.post("/create", async (req, res, next) => {
  try {
    const newStatusInfo = await TicketStatusInfoService.createTicketStatusInfo(req.body);
    res.status(newStatusInfo.status).json({message: newStatusInfo.message, status: newStatusInfo.status});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/view", async (req, res, next) => {
  try {
    const newStatusInfo = await TicketStatusInfoService.getTicketStatusInfo(req.query);
    res.status(newStatusInfo.status).json({
      count: newStatusInfo.totalRecords,
      rows: newStatusInfo.rows,
      totalPages: newStatusInfo.totalPages,
      currentPage: newStatusInfo.currentPage,
      nextPage:newStatusInfo.nextPage,
      previousPage:newStatusInfo.previousPage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch("/edit/:ticketId", async (req, res, next) => {
  try {
    const newStatusInfo = await TicketStatusInfoService.editTicketStatusInfo(req.params,req.body);
    res.status(newStatusInfo.status).json({
        message:newStatusInfo.message,status:newStatusInfo.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;