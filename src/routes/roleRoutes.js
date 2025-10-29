const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const authMiddleware = require("../middleware/authMiddleWare")

// Only ADMIN can create new roles
router.post("/",  roleController.addRole);

// All logged-in users can view roles
router.get("/", roleController.listRoles);

module.exports = router;