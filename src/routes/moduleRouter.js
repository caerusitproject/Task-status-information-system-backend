const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ApplicationInfoService = require("../services/applicationService");
const ModuleController = require("../controllers/moduleController");

router.post("/create", ModuleController.createModule);

router.get("/view", ModuleController.viewModule);

router.put("/edit/:moduleId", ModuleController.editModule);

module.exports = router;
