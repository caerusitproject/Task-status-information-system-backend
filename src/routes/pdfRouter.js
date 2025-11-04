const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const ApplicationInfoService = require("../services/applicationService");

router.get("/weekly", async (req, res, next) => {
  try {
    const newStatusInfo = await ApplicationInfoService.createApplicationInfo(req.body);
    res.status(newStatusInfo.status).json({message: newStatusInfo.message, status: newStatusInfo.status});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.get("/view", async (req, res, next) => {
//   try {
//     const newStatusInfo = await ApplicationInfoService.getApplicationInfo(req.query);
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


// router.put("/edit/:appId", async (req, res, next) => {
//   try {
//     const newStatusInfo = await ApplicationInfoService.editApplicationInfo(req.params,req.body);
//     res.status(newStatusInfo.status).json({
//         message:newStatusInfo.message,status:newStatusInfo.status
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;