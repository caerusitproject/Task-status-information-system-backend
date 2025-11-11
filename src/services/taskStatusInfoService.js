const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  TaskStatusInfo,
  Colors,
  Role,
  EmployeeRole,
  Application,
  TicketingSystem,
} = require("../models");
const { generateFourWeekRanges } = require("../util/modifiers");
const { raw } = require("body-parser");
const { where, Op } = require("sequelize");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class TaskStatusInfoService {
  // 🔹 Create Ticket Status Info
  static async createTimeSheetStatusInfo(params, data) {
    const { taskType } = params;
    const {
      requested_by,
      description,
      ticket_id,
      status,
      color_row,
      reported_by,
      statement_of_the_issue,
      sr_no,
    } = data;
    try {
      console.log("hold on ___", taskType);
      // Validate and create the ticket status info

      if (
        taskType &&
        taskType.toLowerCase() == "assignment"
        // requested_by &&
        // description &&
        // ticket_id &&
        // status &&
        // color_row
      ) {
        console.log("you can enter the value");

        if (
          !data.requested_by ||
          !data.description ||
          !data.status ||
          !data.ticket_id ||
          !data.color_row
        ) {
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const taskStatusInfo = await TaskStatusInfo.create({
          requestedBy: requested_by ? requested_by : "",
          task_type: taskType ? taskType : "",
          ticket_id: ticket_id ? ticket_id : "",
          description: description ? description : "",
          status: status ? status : "",
          color_row: color_row ? color_row : "",
          color_id: color.id,
          reportedBy: "",
          statement_of_the_issue: "",
          // created_by: created_by ? created_by : ''
        });
        return {
          message: "Assignment timesheet created successfully",
          status: 200,
        };
      } else if (
        taskType &&
        taskType.toLowerCase() == "issue"
        // reported_by &&
        // statement_of_the_issue &&
        // sr_no &&
        // status &&
        // ticket_id &&
        // color_row
      ) {
        console.log("status undefined");
        if (
          !data.reported_by ||
          !data.statement_of_the_issue ||
          !data.status ||
          !data.ticket_id ||
          !data.color_row
        ) {
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const taskStatusInfo = await TaskStatusInfo.create({
          reportedBy: reported_by ? reported_by : "",
          task_type: taskType ? taskType : "",
          ticket_id: ticket_id ? ticket_id : "",
          statement_of_the_issue: statement_of_the_issue
            ? statement_of_the_issue
            : "",
          status: status ? status : "",
          color_row: color_row ? color_row : "",
          sr_no: sr_no ? sr_no : "",
          color_id: color.id,
          requestedBy: "",
          description: "",
          // created_by: created_by ? created_by : ''
        });
        return {
          message: "Issue timesheet created successfully",
          status: 200,
        };
      } else if (taskType && taskType.toLowerCase() == "change_request") {
        if (
          !data.requested_by ||
          !data.description ||
          !data.status ||
          !data.ticket_id ||
          !data.color_row
        ) {
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const taskStatusInfo = await TaskStatusInfo.create({
          requestedBy: requested_by ? requested_by : "",
          task_type: taskType ? taskType : "",
          ticket_id: ticket_id ? ticket_id : "",
          description: description ? description : "",
          status: status ? status : "",
          color_row: color_row ? color_row : "",
          color_id: color.id,
          reportedBy: "",
          statement_of_the_issue: "",
          // created_by: created_by ? created_by : ''
        });
        return {
          message: "Change Request timesheet created successfully",
          status: 200,
        };
      }
    } catch (error) {
      return {
        message: error.message,
        status: 200,
      };
    }
  }

  static async createViewDatesDropdown(date) {
    let { currentDate, page } = date;
    currentDate = currentDate.toString();
    if (currentDate) {
      const dateGeneration = await generateFourWeekRanges(
        currentDate.toString(),
        page
      );
      if (
        dateGeneration &&
        dateGeneration.length > 0 &&
        Array.isArray(dateGeneration) &&
        Number(page)
      ) {
        return {
          message: "Date generated Successfully !",
          content: dateGeneration,
          status: 200,
        };
      } else {
        return [];
      }
    } else {
      return { message: "current date needed !", status: 403 };
    }
  }

  //     return { accessToken, refreshToken };
  //   }

  // 🔹 Get Ticket Status Info

  static async getTimeSheetById(params) {
    const { taskId } = params;
    try {
      // data.
      if (taskId) {
        const findSpecificTask = await TaskStatusInfo.findOne({
          where: { task_code: taskId ? taskId.toString() : "" },
          raw: true,
        });
        if (
          findSpecificTask &&
          findSpecificTask instanceof Object &&
          Object.keys(findSpecificTask).length > 0
        ) {
          return {
            message: "Task Id fetched Successfully",
            content: findSpecificTask,
            status: 200,
          };
        } else {
          return {
            message: "Task Id is not present",
            status: 403,
          };
        }
        // console.log("Unique Task", findSpecificTask);
      } else {
        return {
          message: "Please Provide a valid Task Id",
          status: 403,
        };
      }
    } catch (error) {
      console.error("Error fetching Ticket Status Info:", error);
      return { message: "Internal Server Error", status: 500 };
    }
  }

  static async getLegendsColorsandId() {
    try {
      const fetchCurrentColors = await TaskStatusInfo.findAll({
        where: {
          status: ["In Progress", "New", "Reported"],
        },
        attributes: ["color_row", "sr_no", "ticket_id", "task_code", "id"],
        raw: true,
      });
      return {
        status: 200,
        message: "Legends fetched Successfully",
        content:
          fetchCurrentColors && fetchCurrentColors.length > 0
            ? fetchCurrentColors
            : [],
      };
    } catch (error) {
      console.error("Error fetching Ticket Status Info:", error);
      return { message: "Internal Server Error", status: 500 };
    }
  }
  //

  static async getAvailableColors(req, res) {
    try {
      const usedColors = await TaskStatusInfo.findAll({
        where: {
          status: { [Op.ne]: "Completed" }, // colors currently locked
        },
        attributes: ["color_id", "id"],
        raw: true,
      });
      let dumpArr = [];
      const usedColorIds = usedColors.map((item) => {
        if (item.color_id != null) {
          dumpArr.push(item.color_id);
        }
      });
      console.log("colors___", usedColorIds);

      const availableColors = await Colors.findAll({
        where: {
          id: { [Op.notIn]: dumpArr },
        },
        attributes: ["id", "code"],
        raw: true,
      });

      return {
        message: "Data Successfull",
        content: availableColors,
        status: 200,
      };
    } catch (error) {
      return { message: error.message, status: 500 };
    }
  }

  static async editTaskSheetInfo(params, data) {
    try {
      const { taskId } = params;
      if (taskId) {
        const taskStatusEdit = await TaskStatusInfo.findOne({
          where: { task_code: taskId.toString() },
          raw: true,
        });
        if (taskStatusEdit === null) {
          return { message: "Task Sheet cannot be Updated!", status: 403 };
        }
        if (
          taskStatusEdit &&
          taskStatusEdit.task_type.toLowerCase() == "assignment"
        ) {
          if (
            !data.requested_by ||
            !data.description ||
            !data.status ||
            !data.ticket_id ||
            !data.color_row
          ) {
            return { message: "Inappropriate Data in the Body", status: 403 };
          }
          console.log("assignment____", data);
          if (
            Object.keys(data).every(
              (item) =>
                item == "requested_by" ||
                item == "description" ||
                item == "status" ||
                item == "ticket_id" ||
                item == "color_row"
            )
          ) {
            await TaskStatusInfo.update(
              {
                requestedBy: data.requested_by,
                status: data.status,
                description: data.description,
                ticket_id: data.ticket_id,
              },
              {
                where: {
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            return { message: "Other Attributes not allowed", status: 403 };
          }
        } else if (
          taskStatusEdit &&
          taskStatusEdit.task_type.toLowerCase() == "issue"
        ) {
          if (
            !data.reported_by ||
            !data.statement_of_the_issue ||
            !data.status ||
            !data.ticket_id ||
            !data.color_row
          ) {
            return { message: "Inappropriate Data in the Body", status: 403 };
          }
          if (
            Object.keys(data).every(
              (item) =>
                item == "reported_by" ||
                item == "statement_of_the_issue" ||
                item == "status" ||
                item == "ticket_id" ||
                item == "color_row" ||
                item == "sr_no"
            )
          ) {
            await TaskStatusInfo.update(
              {
                reportedBy: data.reported_by,
                status: data.status,
                statement_of_the_issue: data.statement_of_the_issue,
                ticket_id: data.ticket_id,
                sr_no: data.sr_no,
              },
              {
                where: {
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            return { message: "Other Attributes not allowed", status: 403 };
          }
        } else if (
          taskStatusEdit &&
          taskStatusEdit.task_type.toLowerCase() == "change_request"
        ) {
          if (
            !data.requested_by ||
            !data.description ||
            !data.status ||
            !data.ticket_id ||
            !data.color_row
          ) {
            return { message: "Inappropriate Data in the Body", status: 403 };
          }
          console.log("assignment____", data);
          if (
            Object.keys(data).every(
              (item) =>
                item == "requested_by" ||
                item == "description" ||
                item == "status" ||
                item == "ticket_id" ||
                item == "color_row"
            )
          ) {
            await TaskStatusInfo.update(
              {
                requestedBy: data.requested_by,
                status: data.status,
                description: data.description,
                ticket_id: data.ticket_id,
              },
              {
                where: {
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            return { message: "Other Attributes not allowed", status: 403 };
          }
        }
        return { message: "Task Status Info Edited Successfully", status: 201 };
      } else {
        return { message: "Task Id not found", status: 403 };
      }
    } catch (error) {
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
