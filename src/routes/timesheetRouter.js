const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const { authenticate, authorizeRoles } = require("../middlewares/auth");
const TaskStatusInfo = require("../services/taskStatusInfoService");

router.get("/dates/:currentDate/:page", async (req, res, next) => {
  try {
    const newStatusInfo = await TaskStatusInfo.createViewDatesDropdown(
      req.params
    );
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      content: newStatusInfo.content,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/create/:taskType", authenticate, async (req, res, next) => {
  try {
    const user_info = req.user;
    console.log("userId___", user_info);
    const newStatusInfo = await TaskStatusInfo.createTimeSheetStatusInfo(
      req.params,
      req.body,
      user_info
    );
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/viewbyId/:taskId", async (req, res, next) => {
  try {
    const newStatusInfo = await TaskStatusInfo.getTimeSheetById(req.params);
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      content: newStatusInfo.content,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/editTaskId/:taskId", authenticate, async (req, res, next) => {
  try {
    const user_info = req.user;
    const newStatusInfo = await TaskStatusInfo.editTaskSheetInfo(
      req.params,
      req.body,
      user_info
    );
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/legends-colors", authenticate, async (req, res, next) => {
  try {
    const user_info = req.user;
    const newStatusInfo = await TaskStatusInfo.getLegendsColorsandId(user_info);
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      content: newStatusInfo.content,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/color-pallette", async (req, res, next) => {
  try {
    const newStatusInfo = await TaskStatusInfo.getAvailableColors();
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      content: newStatusInfo.content,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/create-task-details/:taskId",
  authenticate,
  TaskController.createTaskDetail
);

router.get(
  "/weekly-summary-view",
  authenticate,
  TaskController.getWeeklySummary
);

router.get(
  "/getquery-suggestions",
  authenticate,
  TaskController.fetchSuggestions
);

router.put(
  "/edit-each-task-details/:taskDetailId",
  authenticate,
  TaskController.editEachTaskSheetDetail
);

// router.post(
//   "/create-time-task/:taskId",
//   TaskController.createTaskDetailStatusTime
// );

module.exports = router;
