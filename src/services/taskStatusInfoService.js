const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TaskStatusInfo, Role, EmployeeRole } = require("../models");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class TaskStatusInfoService {
  // 🔹 Create Ticket Status Info
  static async createTicketStatusInfo(data) {
    const { task_title, task_type, application_name,module,ticket_id,status,percentage_complete,execution_note,created_by } = data;

    // Validate and create the ticket status info
    if(!data){
      throw new Error("Invalid data provided");
    }
    const taskStatusInfo = await TaskStatusInfo.create({
      task_title: task_title ? task_title : '',
      task_type: task_type ? task_type : '',
      application_name: application_name ? application_name : '',
      module: module ? module : '',
      ticket_id: ticket_id ? ticket_id : '',
      status: status ? status : '',
      percentage_complete: percentage_complete ? percentage_complete : 0,
      execution_note: execution_note ? execution_note : '',
      created_by: created_by ? created_by : ''
    });

    return taskStatusInfo;
  }

//     return { accessToken, refreshToken };
//   }

  // 🔹 Register Employee
//   static async registerEmployee(data) {
//     const { name, email, password, roleIds } = data;

//     const existing = await Employee.findOne({ where: { email } });
//     if (existing) throw new Error("Email already exists");

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const employee = await Employee.create({ name, email, password: hashedPassword });

//     if (roleIds && roleIds.length > 0) {
//       await Promise.all(
//         roleIds.map((roleId) =>
//           EmployeeRole.create({ employeeId: employee.id, roleId })
//         )
//       );
//     }

//     return employee;
//   }

  // 🔹 Login Employee
//   static async loginEmployee(email, password) {
//     const employee = await Employee.findOne({
//       where: { email },
//       include: [
//         {
//           model: Role,
//           as: "roles",
//           through: { attributes: [] },
//         },
//       ],
//     });

//     if (!employee) throw new Error("Employee not found");

//     const isPasswordValid = await bcrypt.compare(password, employee.password);
//     if (!isPasswordValid) throw new Error("Invalid credentials");

//     const tokens = this.generateTokens(employee);

//     return {
//       employee: {
//         id: employee.id,
//         name: employee.name,
//         email: employee.email,
//         roles: employee.roles.map((r) => r.roleName),
//       },
//       ...tokens,
//     };
//   }

  // 🔹 Refresh Token
//   static async refreshAccessToken(refreshToken) {
//     if (!refreshToken) throw new Error("No refresh token provided");

//     const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
//     const employee = await Employee.findByPk(decoded.id, {
//       include: [{ model: Role, as: "roles", through: { attributes: [] } }],
//     });

//     if (!employee) throw new Error("Employee not found");

//     return this.generateTokens(employee);
//   }

  // 🔹 Get All Employees
//   static async getAllEmployees() {
//     return Employee.findAll({
//       include: [
//         { model: Role, as: "roles", through: { attributes: [] } }
//       ]
//     });
//   }

  // 🔹 Get Employee by Role (e.g., Manager)
//   static async getEmployeesByRole(roleName) {
//     return Employee.findAll({
//       include: [
//         {
//           model: Role,
//           as: "roles",
//           where: { roleName },
//           through: { attributes: [] },
//         },
//       ],
//     });
//   }

  // 🔹 Get Employee by ID
//   static async getEmployeeById(id) {
//     return Employee.findByPk(id, {
//       include: [{ model: Role, as: "roles", through: { attributes: [] } }],
//     });
//   }
}

module.exports = TaskStatusInfoService;
