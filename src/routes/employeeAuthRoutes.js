const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
const EmployeeService = require("../services/empAuthService");

router.get("/", authenticate, authorizeRoles("HR", "MANAGER"), async (req, res) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/managers", authenticate, authorizeRoles("HR"), async (req, res) => {
  try {
    const managers = await EmployeeService.getEmployeesByRole("Manager");
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", authenticate, authorizeRoles("HR", "MANAGER"), async (req, res) => {
  try {
    const emp = await EmployeeService.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;