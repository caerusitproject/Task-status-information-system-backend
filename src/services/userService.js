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

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 1️⃣ Create user in DB
      const user = await Users.create({
        email_id: emailId,
        password: hashedPassword,
        role: "USER",
      });

      // 2️⃣ Create JWT Payload
      const payload = {
        sub: user.id, // user_id (your middleware expects "sub")
        email: user.email_id,
        role: user.role,
      };

      // 3️⃣ Sign JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // 4️⃣ Return success + token
      return {
        message: "User registered successfully",
        status: 200,
        token, // ← send token to frontend
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
}

module.exports = UserInfoService;
