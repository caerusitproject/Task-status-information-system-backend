const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ApplicationInfoService = require("../services/applicationService");
const ApplicationController = require("../controllers/applicationController");

router.post("/create", ApplicationController.createApplication);

router.get("/view", ApplicationController.viewApplication);

router.put("/edit/:appId", ApplicationController.editApplication);

module.exports = router;
