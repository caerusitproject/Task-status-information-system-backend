const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const TicketStatusInfoService = require("../services/taskStatusInfoService");

router.post("/create", async (req, res, next) => {
  try {
    const newStatusInfo = await TicketStatusInfoService.createTicketStatusInfo(req.body);
    res.status(201).json({message: "Ticket Status Info created successfully", status: 200});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get("/managers", authenticate, authorizeRoles("HR"), async (req, res) => {
//   try {
//     const managers = await EmployeeService.getEmployeesByRole("Manager");
//     res.json(managers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/:id", authenticate, authorizeRoles("HR", "MANAGER"), async (req, res) => {
//   try {
//     const emp = await EmployeeService.getEmployeeById(req.params.id);
//     if (!emp) return res.status(404).json({ message: "Employee not found" });
//     res.json(emp);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

module.exports = router;