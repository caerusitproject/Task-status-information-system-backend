const express = require("express");
const router = express.Router();
// const { authenticate, authorizeRoles } = require("../middleware/authEmpMiddleware");
// const UserInfoService = require("../services/userService");
const UserController = require("../controllers/userController");

router.post("/register-user", UserController.createUser);

// router.get("/login-user", UserInfoService.viewUser);
// router.put("/edit/:userId", UserController.editUser);

module.exports = router;
