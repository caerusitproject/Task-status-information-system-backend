const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  TaskStatusInfo,
  Colors,
  TaskDetail,
  Module,
  Report,
  Clients,
  TaskDetailApplicationMap,
  TaskDetailModuleMap,
  Role,
  EmployeeRole,
  Application,
  TicketingSystem,
  ApplicationModule,
} = require("../models");
const {
  generateFourWeekRanges,
  getNextDate,
  extractQueries,
} = require("../util/modifiers");
const { raw } = require("body-parser");
const { where, Op } = require("sequelize");
const logger = require("../logger");
const sequelize = require("../config/db");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class TaskStatusInfoService {
  // 🔹 Create Ticket Status Info
  static async createTimeSheetStatusInfo(params, data, user_info) {
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
      client_id,
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
          !data.color_row ||
          !data.client_id
        ) {
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const clientIdString = Array.isArray(client_id)
          ? client_id.join(",")
          : client_id?.toString() || "";

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
          user_id: user_info.id,
          client_id: clientIdString ? clientIdString : "",
          // created_by: created_by ? created_by : ''
        });
        logger.info(
          `Assignment timesheet created with ID: ${taskStatusInfo.id}`
        );
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
          !data.color_row ||
          !data.client_id
        ) {
          logger.error("Invalid data provided for Issue timesheet creation");
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const clientIdString = Array.isArray(client_id)
          ? client_id.join(",")
          : client_id?.toString() || "";
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
          user_id: user_info.id,
          client_id: clientIdString ? clientIdString : "",
          // created_by: created_by ? created_by : ''
        });
        logger.info(`Issue timesheet created with ID: ${taskStatusInfo.id}`);
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
          !data.color_row ||
          !data.client_id
        ) {
          logger.error(
            "Invalid data provided for Change Request timesheet creation"
          );
          return { message: "Invalid data provided", status: 400 };
        }
        const color = await Colors.findOne({ where: { code: color_row } });
        const clientIdString = Array.isArray(client_id)
          ? client_id.join(",")
          : client_id?.toString() || "";
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
          user_id: user_info.id,
          client_id: clientIdString ? clientIdString : "",
          // created_by: created_by ? created_by : ''
        });
        logger.info(
          `Change Request timesheet created with ID: ${taskStatusInfo.id}`
        );
        return {
          message: "Change Request timesheet created successfully",
          status: 200,
        };
      }
    } catch (error) {
      logger.error(`Error creating Ticket Status Info: ${error.message}`);
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
        Array.isArray(dateGeneration)
      ) {
        logger.info("Date generated successfully");
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
          logger.info(`Task Id fetched: ${taskId}`);
          return {
            message: "Task Id fetched Successfully",
            content: findSpecificTask,
            status: 200,
          };
        } else {
          logger.error(`Task Id not found: ${taskId}`);
          return {
            message: "Task Id is not present",
            status: 403,
          };
        }
        // console.log("Unique Task", findSpecificTask);
      } else {
        logger.error("Please Provide a valid Task Id");
        return {
          message: "Please Provide a valid Task Id",
          status: 403,
        };
      }
    } catch (error) {
      console.error("Error fetching Ticket Status Info:", error);
      logger.error(`Error fetching Ticket Status Info: ${error.message}`);
      return { message: "Internal Server Error", status: 500 };
    }
  }

  static async getLegendsColorsandId(user_info) {
    try {
      const fetchCurrentColors = await TaskStatusInfo.findAll({
        where: {
          [Op.or]: [{ user_id: null }, { user_id: user_info.id }],
          status: { [Op.ne]: "Completed" },
          // status: ["In Progress", "New", "Reported", "Resolved", "On Hold"],
        },
        attributes: [
          "color_row",
          "sr_no",
          "task_type",
          "status",
          "client_id",
          "ticket_id",
          "task_code",
          "id",
        ],
        order: [["created_at", "ASC"]],
        raw: true,
      });
      logger.info("Legends fetched successfully");

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
      logger.error(`Error fetching Ticket Status Info: ${error.message}`);
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
      logger.info("Available colors fetched successfully");
      return {
        message: "Data Successfull",
        content: availableColors,
        status: 200,
      };
    } catch (error) {
      console.error("Error fetching Available Colors:", error);
      logger.error(`Error fetching Available Colors: ${error.message}`);
      return { message: error.message, status: 500 };
    }
  }

  static async editTaskSheetInfo(params, data, user_info) {
    try {
      const { taskId } = params;
      if (taskId) {
        const taskStatusEdit = await TaskStatusInfo.findOne({
          where: { task_code: taskId.toString() },
          raw: true,
        });
        if (taskStatusEdit === null) {
          logger.error(`Task Sheet not found for Task Id: ${taskId}`);
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
            !data.color_row ||
            !data.client_id
          ) {
            logger.error(
              "Invalid data provided for Assignment timesheet creation"
            );
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
                item == "color_row" ||
                item == "client_id"
            )
          ) {
            await TaskStatusInfo.update(
              {
                requestedBy: data.requested_by,
                status: data.status,
                description: data.description,
                ticket_id: data.ticket_id,
                client_id: data.client_id[0],
                user_id: user_info.id,
              },
              {
                where: {
                  user_id: user_info.id,
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            logger.error(
              "Other Attributes not allowed for Assignment timesheet update"
            );
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
            !data.color_row ||
            !data.client_id
          ) {
            logger.error("Invalid data provided for Issue timesheet update");
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
                item == "sr_no" ||
                item == "client_id"
            )
          ) {
            await TaskStatusInfo.update(
              {
                reportedBy: data.reported_by,
                status: data.status,
                statement_of_the_issue: data.statement_of_the_issue,
                ticket_id: data.ticket_id,
                sr_no: data.sr_no,
                client_id: data.client_id[0],
                user_id: user_info.id,
              },
              {
                where: {
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            logger.error(
              "Other Attributes not allowed for Issue timesheet update"
            );
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
            !data.color_row ||
            !data.client_id
          ) {
            logger.error(
              "Invalid data provided for Change Request timesheet update"
            );
            return { message: "Inappropriate Data in the Body", status: 403 };
          }

          if (
            Object.keys(data).every(
              (item) =>
                item == "requested_by" ||
                item == "description" ||
                item == "status" ||
                item == "ticket_id" ||
                item == "color_row" ||
                item == "client_id"
            )
          ) {
            await TaskStatusInfo.update(
              {
                requestedBy: data.requested_by,
                status: data.status,
                description: data.description,
                ticket_id: data.ticket_id,
                client_id: data.client_id[0],
                user_id: user_info.id,
              },
              {
                where: {
                  task_code: taskId.toString(),
                },
              }
            );
          } else {
            logger.error(
              "Other Attributes not allowed for Change Request timesheet update"
            );
            return { message: "Other Attributes not allowed", status: 403 };
          }
        }
        logger.info(`Change Request timesheet updated for Task Id: ${taskId}`);
        return { message: "Task Status Info Edited Successfully", status: 201 };
      } else {
        logger.error("Please Provide a valid Task Id for timesheet update");
        return { message: "Task Id not found", status: 403 };
      }
    } catch (error) {
      console.error("Error fetching Ticket Status Info:", error);
      logger.error(`Error fetching Ticket Status Info: ${error.message}`);
      return { message: "Internal Server Error", status: 500 };
    }
  }

  static async updateEachTaskWeek(params, payload, user_info) {
    try {
      const { taskDetailId } = params;
      // const userId = req.user.id;          // from JWT
      const clientId = payload.clientId;
      // const nextDate = new Date(payload.updatedDate);
      // nextDate.setDate(nextDate.getDate() + 1);

      // const date = nextDate.getDate();
      // const month = nextDate.getMonth() + 1; // getMonth() is zero-based
      // const year = nextDate.getFullYear();
      const fetchIdTask = await TaskStatusInfo.findOne({
        where: { task_code: payload.taskId },
      });

      if (!fetchIdTask) return { message: "Task Id not present", status: 403 };

      const findTaskDetailId = await TaskDetail.findOne({
        where: { id: taskDetailId },
      });
      if (!findTaskDetailId)
        return { message: "Task Detail Id not present", status: 403 };

      const updateStatus = await TaskStatusInfo.update(
        {
          status: payload.status,
          user_id: user_info.id,
        },
        {
          where: {
            // id: findTaskDetailId.id,
            task_code: payload.taskId.toString(),
          },
        }
      );

      const updateTaskDetailId = await TaskDetail.update(
        {
          hour: payload.hour,
          minute: payload.minute,
          daily_accomplishment: payload.daily_accomplishment,
          rca_investigation: payload.rca_investigation,
          resolution_and_steps: payload.resolution_and_steps,
        },
        {
          where: {
            id: findTaskDetailId.id,
            task_id: payload.taskId.toString(),
            user_id: user_info.id,
          },
        }
      );

      if (payload.applications?.length > 0) {
        // application → modules mapping
        const moduleData = payload.applications.flatMap((app) =>
          app.moduleIds.map((modId) => ({
            app_id: app.applicationId,
            module_id: modId,
          }))
        );

        console.log("module___", moduleData);

        const appIds = [...new Set(moduleData.map((m) => m.app_id))].join(",");
        const moduleIds = moduleData.map((m) => m.module_id).join(",");

        // const clientId = payload.clientId?.map((c_id) => c_id).join(",");

        // Update the single TaskDetail row
        await TaskDetail.update(
          {
            app_id: appIds,
            module_id: moduleIds,
            // client_id: clientId,
          },
          {
            where: {
              id: findTaskDetailId.id,
              user_id: user_info.id,
              task_id: payload.taskId.toString(),
            },
          }
        );
      } else if (
        payload.applications?.length == 0 ||
        payload.applications == null ||
        payload.applications == []
      ) {
        // Clear the app_id and module_id if no applications provided
        await TaskDetail.update(
          {
            app_id: null,
            module_id: null,
          },
          {
            where: {
              id: findTaskDetailId.id,
              user_id: user_info.id,
              task_id: payload.taskId.toString(),
            },
          }
        );
      }
      if (payload.reportName && payload.reportName.length > 0) {
        const reportIds =
          payload.reportName &&
          payload.reportName.length > 0 &&
          payload.reportName.map((r_id) => r_id.id).join(",");

        await TaskDetail.update(
          {
            report_id: reportIds,
          },
          {
            where: {
              id: findTaskDetailId.id,
              user_id: user_info.id,
              task_id: payload.taskId.toString(),
            },
          }
        );
      } else if (payload.reportName && payload.reportName.length == 0) {
        // Clear the report_id if no reportName provided
        await TaskDetail.update(
          {
            report_id: null,
          },
          {
            where: {
              id: findTaskDetailId.id,
              user_id: user_info.id,
              task_id: payload.taskId.toString(),
            },
          }
        );
      }
      // const updateTaskDetailStatus = await TaskDetail.update(
      //   {
      //     daily_accomplishment: payload.daily_accomplishment,
      //     rca_investigation: payload.rca_investigation,
      //     resolution_and_steps: payload.resolution_and_steps,
      //     hour: payload.hour,
      //     minute: payload.minute,
      //   },
      //   {
      //     where: {
      //       id: payload.id,
      //     },
      //   }
      // );
      console.log("update____", updateTaskDetailId[0]);
      if (updateTaskDetailId && updateTaskDetailId[0] == 0) {
        logger.error(`Time Sheet Id Mismatch for Task Id: ${payload.taskId}`);
        return { message: "Time Sheet Id Mismatch", status: 403 };
      } else {
        logger.info(
          `Time Sheet Updated Successfully for Task Id: ${payload.taskId}`
        );
        return { message: "Time Sheet Updated Successfully", status: 200 };
      }
    } catch (error) {
      logger.error(`Error updating Time Sheet: ${error.message}`);
      return { message: error.message, status: 403 };
    }
  }

  static async getTaskReportApplicationModule(params, user_info) {
    try {
      const { taskId } = params;
      const applicationModuleReportId = await TaskDetail.findAll({
        where: { user_id: user_info.id, task_id: taskId.toString() },
        attributes: ["app_id", "module_id", "report_id"],
        raw: true,
      });

      // 🔥 Extract app_ids, safely handle null, empty, number, comma strings
      const appIds = applicationModuleReportId
        .flatMap((item) => {
          if (!item.app_id) return [];
          return item.app_id
            .toString()
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id !== "");
        })
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      const moduleIds = applicationModuleReportId
        .flatMap((item) => {
          if (!item.module_id) return [];
          return item.module_id
            .toString()
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id !== "");
        })
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      const reportIds = applicationModuleReportId
        .flatMap((item) => {
          if (!item.report_id) return [];
          return item.report_id
            .toString()
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id !== "");
        })
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      const ApplicationNameIds = await Application.findAll({
        where: { id: appIds },
        attributes: ["id", "name"],
        raw: true,
      });

      const ModuleNameIds = await Module.findAll({
        where: { id: moduleIds },
        attributes: ["id", "name"],
        raw: true,
      });

      const ReportNameIds = await Report.findAll({
        where: { id: reportIds },
        attributes: ["id", "name"],
        raw: true,
      });
      logger.info(`Fetched Application, Module, Report for Task Id: ${taskId}`);
      return {
        message: "Task Detail Entry Created Successfully!",
        status: 201,
        content: {
          applicationName: ApplicationNameIds,
          moduleName: ModuleNameIds,
          reportName: ReportNameIds,
        },
      };
    } catch (error) {
      logger.error(
        `Error fetching Application, Module, Report: ${error.message}`
      );
      return { message: error.message, status: 500 };
    }
  }

  static createTaskDetailEntry = async (taskId, payload, user_info) => {
    try {
      const task = await TaskStatusInfo.findOne({
        where: { task_code: taskId.toString() },
        raw: true,
      });

      const allAppIds = payload.applications
        .map((a) => a.applicationId)
        .filter((id) => id !== undefined && id !== null);

      // Extract ALL moduleIds (flatten arrays)
      const allModuleIds = payload.applications
        .flatMap((a) => (Array.isArray(a.moduleIds) ? a.moduleIds : []))
        .filter((id) => id !== undefined && id !== null);
      const reportArr = payload.reportName || [];
      if (!task) throw new Error("Task Id not found");

      const detailData = {
        tstatusId: task.id,
        taskId: taskId,
        sr_no: task.sr_no,
        task_type: task.task_type,
        hour: payload.hour,
        minute: payload.minute,
        client_id: task.client_id,
        user_id: user_info.id,
        app_id: allAppIds.length > 0 ? allAppIds.join(",") : null,
        module_id: allModuleIds.length > 0 ? allModuleIds.join(",") : null,
        report_id:
          reportArr.length > 0 ? reportArr.map((r) => r.id).join(",") : null,
      };
      switch (task.task_type) {
        case "assignment":
          if (!payload.status)
            return {
              message: "status is required!",
              status: 403,
            };
          // if (payload.daily_accomplishment) {
          detailData.daily_accomplishment = payload.daily_accomplishment;
          detailData.hour = payload.hour;
          detailData.minute = payload.minute;
          console.log("id_________", detailData);
          // detailData.status = payload.status;
          // }
          break;

        case "issue":
          if (!payload.status)
            return {
              message: "status is required!",
              status: 403,
            };
          // if (payload.resolution_and_steps || payload.rca_investigation)
          detailData.rca_investigation = payload.rca_investigation;
          detailData.resolution_and_steps = payload.resolution_and_steps;
          detailData.hour = payload.hour;
          detailData.minute = payload.minute;
          // detailData.status = payload.status;
          break;

        case "change_request":
          if (!payload.status)
            return {
              message: "status is required!",
              status: 403,
            };
          detailData.daily_accomplishment = payload.daily_accomplishment;
          detailData.hour = payload.hour;
          detailData.minute = payload.minute;
          // detailData.status = payload.status;
          break;

        case "ticket_less":
          if (!payload.status)
            return {
              message: "status is required!",
              status: 403,
            };
          detailData.daily_accomplishment = payload.daily_accomplishment;
          detailData.hour = payload.hour;
          detailData.minute = payload.minute;
          // detailData.status = payload.status;
          break;

        default:
          return {
            message: `Unsupported task type: ${task.task_type}`,
            status: 403,
          };
      }

      // 3️⃣ Create the detail entry
      // let updateStatus = await TaskStatusInfo.update(
      //   {
      //     status: payload.status,
      //   },
      //   {
      //     where: {
      //       task_code: taskId,
      //     },
      //   }
      // );
      const newDetail = await TaskDetail.create(detailData);
      logger.info(`Task Detail Entry Created for Task Id: ${taskId}`);
      console.log("create task sheet info___", newDetail.get({ plain: true }));
      return {
        message: "Task Detail Entry Created Successfully!",
        status: 201,
        content:
          newDetail &&
          Object.keys(newDetail).length > 0 &&
          newDetail.get({ plain: true }),
      };
    } catch (error) {
      logger.error(`Error creating Task Detail Entry: ${error.message}`);
      return { message: error.message, status: error.status };
    }
  };

  // static createEachTimeTaskDetailEntry = async (taskId, payload) => {
  //   try {
  //     const task = await TaskStatusInfo.findOne({
  //       where: { task_code: taskId.toString() },
  //     });
  //     if (!task) throw new Error("Task Id not found");

  //     const detailData = {
  //       tstatusId: task.id,
  //       taskId: taskId,
  //       task_type: task.task_type,
  //       hour: payload.hour,
  //       minute: payload.minute,
  //       status: payload.status,
  //     };
  //     const newDetail = await TaskDetail.create(detailData);
  //     return {
  //       message: "Task Detail Each Entry Created Successfully!",
  //       status: 201,
  //     };
  //   } catch (err) {
  //     return { message: error.message, status: error.status };
  //   }
  // };

  static fetchQuerySuggestion = async (Query, user_info) => {
    try {
      // const TaskId = taskId.trim();
      const query = Query.trim();

      if (!query) {
        return []; // return empty if no query
      }

      // Step 1: fetch rows which contain HTML text
      const results = await TaskDetail.findAll({
        where: {
          user_id: user_info.id,
          // task_id: TaskId,
          [Op.or]: [
            { daily_accomplishment: { [Op.iLike]: `%${query}%` } },
            { rca_investigation: { [Op.iLike]: `%${query}%` } },
            { resolution_and_steps: { [Op.iLike]: `%${query}%` } },
          ],
        },
        raw: true,
        order: [
          ["task_id", "DESC"], // priority 1
          ["created_at", "DESC"], // priority 2 (optional)
        ],
        limit: 10,
      });

      let allQueries = [];
      console.log("results", results);
      // Step 2: Extract queries from EACH HTML field
      for (const row of results) {
        const html1 = row.daily_accomplishment || "";
        const html2 = row.rca_investigation || "";
        const html3 = row.resolution_and_steps || "";

        allQueries.push(...extractQueries(html1));
        allQueries.push(...extractQueries(html2));
        allQueries.push(...extractQueries(html3));
      }

      // Step 3: Now clean-filter the extracted SQL queries
      const filtered = allQueries.filter((q) =>
        q.toLowerCase().includes(query.toLowerCase())
      );

      const clean = filtered.map((q) => q.replace(/"/g, "'"));
      let dumpArr = clean.slice(0, 10);

      logger.info("Clean SQL Suggestions =>", dumpArr);

      return { content: clean };
    } catch (err) {
      logger.error(`Error fetching query suggestions: ${err.message}`);
      throw err;
    }
  };

  static getWeeklyTasks = async (startDate, endDate, user_info) => {
    const start = new Date(startDate);
    const end = new Date(getNextDate(endDate ? endDate : ""));
    const tasks = await TaskStatusInfo.findAll({
      include: [
        {
          model: TaskDetail,
          as: "taskstaskdetails",
          required: true, // only include tasks having details
          where: {
            user_id: user_info.id,
            created_at: { [Op.between]: [start, end] },
          },
          attributes: [
            "id",
            "hour",
            "minute",
            "sr_no",
            "app_id",
            "module_id",
            "report_id",
            "created_at",
            "updated_at",
            "daily_accomplishment",
            "rca_investigation",
            "resolution_and_steps",
          ],
        },
        {
          model: Colors,
          as: "color",
          attributes: ["code"],
        },
      ],
      attributes: [
        // "id",
        "ticket_id",
        "task_code",
        "client_id",
        "task_type",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      raw: false,
      nest: true,
    });
    // 🧩 Group by TaskDetail.created_at date
    const grouped = {};

    for (const ele of tasks) {
      if (ele && Array.isArray(ele.taskstaskdetails)) {
        for (const item of ele.taskstaskdetails) {
          // ----------------------
          // APP NAME
          // ----------------------
          let currentAppName = "";
          let reportName = "";
          let moduleName = "";

          if (item.app_id) {
            const applicationIds = item.app_id?.toString().split(",");

            let app = await Promise.all(
              applicationIds.map(async (id) => {
                const application = await Application.findOne({
                  where: { id },
                  raw: true,
                });
                return (
                  { id: application?.id, appName: application?.name } || ""
                );
              })
            );

            item.appName = app;
          }

          if (item.report_id) {
            console.log("report_id", item.report_id);
            const reportIds = item.report_id?.toString().split(",");

            // Fetch all module names using Promise.all
            let reports = await Promise.all(
              reportIds.map(async (id) => {
                const report = await Report.findOne({
                  where: { id },
                  raw: true,
                });
                return { id: report?.id, reportName: report?.name } || "";
              })
            );

            item.reportName = reports;
          }

          // item.appName = currentAppName;

          // ----------------------
          // MODULE NAME (single or comma separated)
          // ----------------------

          if (item.module_id) {
            const moduleIds = item.module_id.toString().split(",");

            // Fetch all module names using Promise.all
            let modules = await Promise.all(
              moduleIds.map(async (id) => {
                const mod = await Module.findOne({
                  where: { id },
                  raw: true,
                });
                return { id: mod?.id, moduleName: mod?.name } || "";
              })
            );
            item.moduleName = modules;
          }

          if (ele.client_id) {
            const clientIds = ele.client_id?.toString().split(",");

            // Fetch all module names using Promise.all
            let clients = await Promise.all(
              clientIds.map(async (id) => {
                const cli = await Clients.findOne({
                  where: { id },
                  raw: true,
                });
                return { id: cli?.id, clientName: cli?.name } || "";
              })
            );
            item.clientName = clients;
          }
        }
      }
    }

    // let fetchAppName = await Application.findOne({
    //   where: { id: item.taskstaskdetails.app_id },
    // });

    tasks.map((task) => {
      (task.taskstaskdetails || []).map((detail) => {
        // Use TaskDetail.created_at for grouping, not TaskStatusInfo
        const date = detail.created_at
          ? detail.created_at.toISOString().split("T")[0]
          : task.created_at.toISOString().split("T")[0];

        const colorCode = task.color && task.color.code ? task.color.code : "";

        if (!grouped[date]) grouped[date] = [];

        grouped[date].push({
          id: detail.id,
          taskId: task.task_code,
          ticketId: task.ticket_id,
          taskType: task.task_type,
          status: task.status,
          updatedDate: detail.updated_at,
          colorCode,
          hours: detail.hour,
          minutes: detail.minute,
          sr_no: detail.sr_no,
          appName: detail.appName || "",
          modulename: detail.moduleName || "",
          reportName: detail.reportName || "",
          clientName: detail.clientName || [],
          dailyAccomplishments: detail.daily_accomplishment,
          investigationRCA: detail.rca_investigation,
          resolutions: detail.resolution_and_steps,
        });
      });
    });
    logger.info("Grouped tasks by date successfully");
    // 🧾 Convert to array sorted by most recent date first
    const week = Object.entries(grouped)
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { week };
  };
}

module.exports = TaskStatusInfoService;
