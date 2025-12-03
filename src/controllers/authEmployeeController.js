const EmployeeService = require("../services/employeeService");

exports.register = async (req, res) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    res.status(201).json({ message: "Employee registered successfully", employee });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await EmployeeService.login(email, password);
    res.json({ message: "Login successful", ...result });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await EmployeeService.refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};