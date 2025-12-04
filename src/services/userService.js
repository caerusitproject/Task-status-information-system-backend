const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
const logger = require("../logger");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class UserInfoService {
  // 🔹 Create Application Status Info
  static async registerUsers(data) {
    const { emailId, password } = data;

    // Validate required fields
    if (!emailId || !password) {
      return { message: "Invalid data provided", status: 400 };
    }

    const existingUser = await Users.findOne({
      where: { email_id: emailId },
    });

    if (existingUser) {
      return { message: "Email already exists", status: 409 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create JWT Payload
      const user = await Users.create({
        email_id: emailId,
        password: hashedPassword,
        role: "USER",
      });
      logger.info(`User registered with ID: ${user.id}`);
      return {
        message: "User registered successfully",
        status: 200,
        user: {
          id: user.id,
          email: user.email_id,
          role: user.role,
        },
      };
    } catch (err) {
      console.error("Error creating user:", err);
      logger.error(`Error registering user: ${err.message}`);
      return { message: "Internal server error", status: 500 };
    }
  }
  static async loginUsers(data) {
    const { emailId, password } = data;
    // Validate required fields
    if (!emailId || !password) {
      return { message: "Invalid data provided", status: 400 };
    }
    try {
      const user = await Users.findOne({ where: { email_id: emailId } });
      if (!user) {
        logger.error(`Login failed for email: ${emailId} - User not found`);
        return { message: "Invalid email or password", status: 401 };
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        logger.error(`Login failed for email: ${emailId} - Incorrect password`);
        return { message: "Invalid email or password", status: 401 };
      }
      // Create JWT Payload
      const payload = {
        sub: user.id,
        email: user.email_id,
        role: user.role,
      };

      const updateActivate = await Users.update(
        { is_Active: "true" },
        { where: { id: user.id } }
      );

      // Sign JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      logger.info(`User logged in with ID: ${user.id}`);
      // Return success + token
      return {
        message: "Login successful",
        status: 200,
        token,
        user: {
          id: user.id,
          email: user.email_id,
          role: user.role,
        },
      };
    } catch (err) {
      console.error("Error during login:", err);
      return { message: "Internal server error", status: 500 };
    }
  }

  static async logoutUsers(data) {
    const { emailId } = data;
    // Validate required fields
    if (!emailId) {
      return { message: "Invalid data provided", status: 400 };
    }
    try {
      const user = await Users.findOne({ where: { email_id: emailId } });
      if (!user) {
        return { message: "Invalid email", status: 401 };
      }
      const updateDeactivate = await Users.update(
        { is_Active: "false" },
        { where: { id: user.id } }
      );
      return {
        message: "Logout successful",
        status: 200,
      };
    } catch (err) {
      console.error("Error during logout:", err);
      return { message: "Internal server error", status: 500 };
    }
  }
}

module.exports = UserInfoService;
