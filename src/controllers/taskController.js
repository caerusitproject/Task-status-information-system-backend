const express = require("express");
const { Task, TaskStatusInfo, Colors } = require("../models");
const auditService = require("../services/auditService");
const { authorizeRoles } = require("../middlewares/auth");
const {
  createTaskDetailEntry,
  createEachTimeTaskDetailEntry,
  getWeeklyTasks,
  updateEachTaskWeek,
  fetchQuerySuggestion,
  getTaskReportApplicationModule,
} = require("../services/taskStatusInfoService");
// const { content } = require("pdfkit/js/page");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user.id;
    if (payload.status === "Completed" && payload.percentageComplete < 100) {
      return res
        .status(400)
        .json({ message: "Completed tasks must have 100% completion" });
    }
    if (!payload.startTime) payload.startTime = new Date();
    const task = await Task.create(payload);
    await auditService.logCreate(task, req.user.username);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ order: [["updatedAt", "DESC"]] });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    const old = t.toJSON();
    await t.update(req.body);
    await auditService.logUpdate(t, old, req.user.username);
    res.json(t);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authorizeRoles("ADMIN"), async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });
    await t.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

const createTaskDetail = async (req, res) => {
  try {
    const { taskId } = req.params;
    const payload = req.body;
    const user_info = req.user;
    console.log("create_task_detail___", user_info);

    const result = await createTaskDetailEntry(taskId, payload, user_info);

    res.status(result.status).json({
      message: result.message,
      status: result.status,
      content: result.content,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// const createTaskDetailStatusTime = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const payload = req.body;

//     const result = await createEachTimeTaskDetailEntry(taskId, payload);

//     res.status(201).json({
//       message: result.message,
//       status: result.status,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const getWeeklySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // e.g., ?startDate=2025-11-05&endDate=2025-11-10
    const user_info = req.user;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate required" });
    }

    const data = await getWeeklyTasks(startDate, endDate, user_info);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editEachTaskSheetDetail = async (req, res) => {
  try {
    const user_info = req.user;

    // if (!updatedDate) {
    //   return res.status(400).json({ message: "Updated Date required" });
    // }

    const result = await updateEachTaskWeek(req.params, req.body, user_info);

    console.log("result__", result);

    res.status(result.status).json({
      message: result.message,
      status: result.status,
    });
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const viewApplicationReportTaskSheetDetail = async (req, res) => {
  try {
    const user_info = req.user;

    const result = await getTaskReportApplicationModule(req.params, user_info);

    console.log("result__", result);

    res.status(result.status).json({
      message: result.message,
      status: result.status,
      content: result.content,
    });
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fetchSuggestions = async (req, res) => {
  try {
    // const { taskId } = req.params;
    // e.g., ?startDate=2025-11-05&endDate=2025-11-10

    const { query } = req.query;
    const user_info = req.user;
    // if (!taskId) {
    //   return res.status(400).json({ message: "Task Id required!" });
    // }

    if (!query) {
      return res.status(400).json({ message: "Query is required!" });
    }

    const data = await fetchQuerySuggestion(query, user_info);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Query Suggestions!", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createDefaultTicket = async () => {
  try {
    const existing = await TaskStatusInfo.findOne({
      where: { ticket_id: "DEFAULT-TICKET" },
    });

    if (existing) {
      console.log("Default 'ticket_less' entry already exists.");
      return;
    }

    const defaultColor = await Colors.findOne({
      where: { code: "#ffffff56" },
    });

    await TaskStatusInfo.create({
      ticket_id: "DEFAULT-TICKET",
      requestedBy: "system",
      reportedBy: "system",
      task_type: "ticket_less",
      description: "Default entry for ticket_less task type.",
      statement_of_the_issue: "N/A",
      status: "New",
      color_row: "#ffffff56",
      color_id: defaultColor ? defaultColor.id : null,
    });

    console.log("Default ticket created with color_id:", defaultColor?.id);
  } catch (error) {
    console.error("❌ Error inserting default entry:", error);
  }
};

module.exports = {
  router,
  createTaskDetail,
  getWeeklySummary,
  editEachTaskSheetDetail,
  fetchSuggestions,
  viewApplicationReportTaskSheetDetail,
  createDefaultTicket,
};
