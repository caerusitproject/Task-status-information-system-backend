/*const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};*/

const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roleConfigs) => {
  return (req, res, next) => {
    const userRole = req.user.role || req.user.roles;
    const allowedRoles = roleConfigs.map((r) => (typeof r === "string" ? r : r.role));

    if (!allowedRoles.includes(userRole)) {
      const matchedConfig = roleConfigs.find((r) => typeof r === "object" && r.role === userRole);
      const customMessage =
        matchedConfig?.message || `Access denied. Only ${allowedRoles.join(", ")} can access this. Please contact admin for permission`;
      return res.status(403).json({
        success: false,
        message: customMessage,
      });
    }

    next();
  };
};
