const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  TaskStatusInfo,
  Colors,
  TaskDetail,
  Module,
  TaskDetailApplicationMap,
  TaskDetailModuleMap,
  Role,
  EmployeeRole,
  Application,
  TicketingSystem,
  ApplicationModule,
} = require("../models");
const { generateFourWeekRanges, getNextDate } = require("../util/modifiers");
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
        Array.isArray(dateGeneration)
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
          status: { [Op.ne]: "Completed" },
          // status: ["In Progress", "New", "Reported", "Resolved", "On Hold"],
        },
        attributes: [
          "color_row",
          "sr_no",
          "task_type",
          "status",
          "ticket_id",
          "task_code",
          "id",
        ],
        order: [["created_at", "ASC"]],
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

  static async updateEachTaskWeek(params, payload) {
    try {
      const { taskDetailId } = params;
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
        },
        {
          where: {
            id: findTaskDetailId.id,
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

        // Update the single TaskDetail row
        await TaskDetail.update(
          {
            app_id: appIds,
            module_id: moduleIds,
          },
          {
            where: {
              id: findTaskDetailId.id,
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
        return { message: "Time Sheet Id Mismatch", status: 403 };
      } else {
        return { message: "Time Sheet Updated Successfully", status: 200 };
      }
    } catch (error) {
      console.log("error__", error);
      return { message: error.message, status: 403 };
    }
  }

  static createTaskDetailEntry = async (taskId, payload) => {
    try {
      const task = await TaskStatusInfo.findOne({
        where: { task_code: taskId.toString() },
        raw: true,
      });
      if (!task) throw new Error("Task Id not found");

      const detailData = {
        tstatusId: task.id,
        taskId: taskId,
        sr_no: task.sr_no,
        task_type: task.task_type,
        hour: payload.hour,
        minute: payload.minute,
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

  // static getWeeklyTasks = async (startDate, endDate) => {
  //   const tasks = await TaskStatusInfo.findAll({
  //     include: [
  //       {
  //         model: TaskDetail,
  //         as: "taskstaskdetails",
  //         required: true, // ⬅️ important! INNER JOIN instead of LEFT JOIN
  //         where: {
  //           created_at: { [Op.between]: [startDate, endDate] },
  //         },
  //         attributes: [
  //           "id",
  //           "hour",
  //           "minute",
  //           "updated_at",
  //           "daily_accomplishment",
  //           "rca_investigation",
  //           "resolution_and_steps",
  //         ],
  //       },
  //       {
  //         model: Colors,
  //         as: "color",
  //         attributes: ["code"],
  //       },
  //     ],
  //     attributes: [
  //       "id",
  //       "ticket_id",
  //       "task_code",
  //       "task_type",
  //       "status",
  //       "created_at",
  //     ],
  //     order: [["created_at", "DESC"]],
  //     raw: false,
  //     nest: true,
  //   });

  //   // 🧩 Group by date
  //   const grouped = {};

  //   tasks.forEach((task) => {
  //     const date = task.created_at.toISOString().split("T")[0];

  //     // Each task can have multiple task details
  //     (task.taskstaskdetails || []).forEach((detail) => {
  //       if (!grouped[date]) grouped[date] = [];

  //       grouped[date].push({
  //         id: detail.id,
  //         taskId: task.task_code,
  //         ticketId: task.ticket_id,
  //         taskType: task.task_type,
  //         status: task.status,
  //         updatedDate: detail.updated_at,
  //         colorCode: task.color?.code || "#FFFFFF",
  //         hours: detail.hour, // ✅ match model field
  //         minutes: detail.minute, // ✅ match model field
  //         dailyAccomplishments: detail.daily_accomplishment,
  //         investigationRCA: detail.rca_investigation,
  //         resolutions: detail.resolution_and_steps,
  //       });
  //     });
  //   });

  //   // 🧾 Format output
  //   const week = Object.entries(grouped)
  //     .map(([date, tasks]) => ({ date, tasks }))
  //     .sort((a, b) => new Date(b.date) - new Date(a.date));

  //   return { week };
  // };

  static getWeeklyTasks = async (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(getNextDate(endDate ? endDate : ""));
    const tasks = await TaskStatusInfo.findAll({
      include: [
        {
          model: TaskDetail,
          as: "taskstaskdetails",
          required: true, // only include tasks having details
          where: {
            created_at: { [Op.between]: [start, end] },
          },
          attributes: [
            "id",
            "hour",
            "minute",
            "sr_no",
            "app_id",
            "module_id",
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

          if (item.app_id) {
            const app = await Application.findOne({
              where: { id: item.app_id },
              raw: true,
            });

            currentAppName = app?.name || "";
          }

          item.appName = currentAppName;

          // ----------------------
          // MODULE NAME (single or comma separated)
          // ----------------------
          let moduleName = "";

          if (item.module_id) {
            const moduleIds = item.module_id.toString().split(",");

            // Fetch all module names using Promise.all
            const modules = await Promise.all(
              moduleIds.map(async (id) => {
                const mod = await Module.findOne({
                  where: { id },
                  raw: true,
                });
                return mod?.name || "";
              })
            );

            // Join names → "Finance, HR"
            moduleName = modules.filter(Boolean).join(",");
          }

          item.moduleName = moduleName;
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
          dailyAccomplishments: detail.daily_accomplishment,
          investigationRCA: detail.rca_investigation,
          resolutions: detail.resolution_and_steps,
        });
      });
    });

    // 🧾 Convert to array sorted by most recent date first
    const week = Object.entries(grouped)
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { week };
  };
}

module.exports = TaskStatusInfoService;
