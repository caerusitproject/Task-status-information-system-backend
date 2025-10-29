const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Employee, Role, EmployeeRole } = require("../models");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class EmployeeService {
  // 🔹 Generate JWT & Refresh Tokens
  static generateTokens(employee) {
    const accessToken = jwt.sign(
      { id: employee.id, email: employee.email, roles: employee.roles },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign({ id: employee.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  // 🔹 Register Employee
  static async registerEmployee(data) {
    const { name, email, password, roleIds } = data;

    const existing = await Employee.findOne({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Employee.create({ name, email, password: hashedPassword });

    if (roleIds && roleIds.length > 0) {
      await Promise.all(
        roleIds.map((roleId) =>
          EmployeeRole.create({ employeeId: employee.id, roleId })
        )
      );
    }

    return employee;
  }

  // 🔹 Login Employee
  static async loginEmployee(email, password) {
    const employee = await Employee.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
    });

    if (!employee) throw new Error("Employee not found");

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const tokens = this.generateTokens(employee);

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        roles: employee.roles.map((r) => r.roleName),
      },
      ...tokens,
    };
  }

  // 🔹 Refresh Token
  static async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("No refresh token provided");

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const employee = await Employee.findByPk(decoded.id, {
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
    });

    if (!employee) throw new Error("Employee not found");

    return this.generateTokens(employee);
  }

  // 🔹 Get All Employees
  static async getAllEmployees() {
    return Employee.findAll({
      include: [
        { model: Role, as: "roles", through: { attributes: [] } }
      ]
    });
  }

  // 🔹 Get Employee by Role (e.g., Manager)
  static async getEmployeesByRole(roleName) {
    return Employee.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          where: { roleName },
          through: { attributes: [] },
        },
      ],
    });
  }

  // 🔹 Get Employee by ID
  static async getEmployeeById(id) {
    return Employee.findByPk(id, {
      include: [{ model: Role, as: "roles", through: { attributes: [] } }],
    });
  }
}

module.exports = EmployeeService;
