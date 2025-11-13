const express = require("express");
const { Task } = require("../models");
const auditService = require("../services/auditService");
const { authorizeRoles } = require("../middlewares/auth");
const {
  createTaskDetailEntry,
  createEachTimeTaskDetailEntry,
  getWeeklyTasks,
  updateEachTaskWeek,
} = require("../services/taskStatusInfoService");

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

    const result = await createTaskDetailEntry(taskId, payload);

    res.status(result.status).json({
      message: result.message,
      status: result.status,
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

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate required" });
    }

    const data = await getWeeklyTasks(startDate, endDate);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editEachTaskSheetDetail = async (req, res) => {
  try {
    const { updatedDate } = req.params;

    if (!updatedDate) {
      return res.status(400).json({ message: "Updated Date required" });
    }

    const data = await updateEachTaskWeek(req.params, req.body);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  router,
  createTaskDetail,
  getWeeklySummary,
  editEachTaskSheetDetail,
};
