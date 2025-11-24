const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const ApplicationInfoService = require("../services/applicationService");
const ClientController = require("../controllers/clientController");

router.post("/create", ClientController.createClient);

router.get("/view", ClientController.viewClient);
router.put("/edit/:clientId", ClientController.editClient);

module.exports = router;
