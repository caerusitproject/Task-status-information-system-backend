const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TaskStatusInfo, Role, EmployeeRole } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class TaskStatusInfoService {
  // 🔹 Create Ticket Status Info
  static async createTicketStatusInfo(data) {
    const { task_title, task_type,module,ticket_id,status,percentage_complete,execution_note,created_by,application_id,ticketing_system_id } = data;

    // Validate and create the ticket status info
    if(!data.task_title || !data.task_type || !data.status || !data.created_by || !data.percentage_complete || !data.ticket_id || !data.module || !data.created_by || !data.ticketing_system_id || !data.application_id){
      return { message: "Invalid data provided", status: 400 };
    }
    const taskStatusInfo = await TaskStatusInfo.create({
      task_title: task_title ? task_title : '',
      task_type: task_type ? task_type : '',
      module: module ? module : '',
      application_id:application_id ? application_id :'',
      ticketing_system_id : ticketing_system_id ?  ticketing_system_id:'',
      ticket_id: ticket_id ? ticket_id : '',
      status: status ? status : '',
      percentage_complete: percentage_complete ? percentage_complete : 0,
      execution_note: execution_note ? execution_note : '',
      created_by: created_by ? created_by : ''
    });

    return { message: "Ticket Status Info created successfully", status: 200 };
  }

//     return { accessToken, refreshToken };
//   }

  // 🔹 Get Ticket Status Info

  static async getTicketStatusInfo(data = {}) {
  try {
    const page = parseInt(data.page, 10) || 1;
    const pageSize = parseInt(data.pagesize, 10) || 10;
    let result;

    if (data.page && data.pagesize) {
      result = await TaskStatusInfo.findAndCountAll({
        raw: true,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [["id", "ASC"]],
      });
    } else {
      result = await TaskStatusInfo.findAndCountAll({
        raw: true,
        order: [["id", "ASC"]],
      });
    }

    console.log("view_____", result.rows);

    if (!result.rows || !result.rows.length) {
      return { message: "Ticket Status Info not found", status: 403 };
    }

    // Calculate pagination details
    const totalRecords = result.count;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      status: 200,
      totalRecords,
      totalPages,
      currentPage: page,
      nextPage,
      previousPage,
      rows: result.rows,
    };
  } catch (error) {
    console.error("Error fetching Ticket Status Info:", error);
    return { message: "Internal Server Error", status: 500 };
  }
}

// static async getTicketStatusInfo(data = {}) {
//   try {
//     const page = parseInt(data.page, 10) || 1;
//     const pageSize = parseInt(data.pagesize, 10) || 10;
//     const nextPage = data.page < totalPages ? page + 1 : null;
//     const previousPage = page > 1 ? page - 1 : null;
//     let result ;
//     if(data.page && data.pagesize){
//       result  = await TaskStatusInfo.findAndCountAll({
//       raw: true,
//       offset: (page - 1) * pageSize,
//       limit: pageSize,
//       order: [['id', 'ASC']], // optional for consistent results
//     });
//     }else{
//          result = await TaskStatusInfo.findAndCountAll({
//           raw: true,
//           order: [['id', 'ASC']], // optional for consistent results
//         });
//     }
//     console.log('view_____',result.rows)

//     if (!result.rows.length) {
//       return { message: "Ticket Status Info not found", status: 403 };
//     }

//     return {
//       status: 200,
//       totalRecords: result.count,
//       totalPages: Math.ceil(result.count / pageSize),
//       currentPage: page,
//       rows: result.rows,
//     };
//   } catch (error) {
//     console.error("Error fetching Ticket Status Info:", error);
//     return { message: "Internal Server Error", status: 500 };
//   }
// }

static async editTicketStatusInfo(data,body){
    try{
        if(data.ticketId){
          const taskStatusEdit = await TaskStatusInfo.findOne({ where: { id: data.ticketId },raw:true });
          if(taskStatusEdit === null){
             return { message: "Ticket Status cannot be Updated!", status: 403 };
          }
          if(!body.execution_note || !body.status || !body.task_type){
            return { message :'Inappropriate Data in the Body', status: 403}
          }
          if(Object.keys(body).every((item)=> item == 'task_type' || item == 'status' || item == 'execution_note')){
              await TaskStatusInfo.update({
                execution_note:body.execution_note,
                status:body.status,
                task_type:body.task_type
              },
                {
                    where: {
                        id: data.ticketId,
                    },
                },
            )
          }else{
             return {  message:'Other Attributes not allowed',status:403}
          }
        console.log('edited Ticekt Status Info___',taskStatusEdit,body)
        return {  message:'Task Status Info Edited Successfully',status:201}
         
        }else{
            return {message:'Ticket Id not found',status:403}
        }
    }catch(error){
    console.error("Error fetching Ticket Status Info:", error);
    return { message: "Internal Server Error", status: 500 };
    }
}

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
