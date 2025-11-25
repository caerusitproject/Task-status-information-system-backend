const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
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
        return { message: "Invalid email or password", status: 401 };
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return { message: "Invalid email or password", status: 401 };
      }
      // Create JWT Payload
      const payload = {
        sub: user.id,
        email: user.email_id,
        role: user.role,
      };

      // Sign JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });
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
}

module.exports = UserInfoService;
