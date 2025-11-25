const jwt = require("jsonwebtoken");
const config = require("../../config/config").jwt;
const { Users } = require("../models");

// exports.authenticate = async (req, res, next) => {
//   const auth = req.headers["authorization"];
//   if (!auth) return res.status(401).json({ message: "No token" });
//   const token = auth.split(" ")[1];
//   try {
//     const payload = jwt.verify(token, config.secret);
//     console.log("payload______", payload, token);
//     const user = await User.findByPk(payload.sub);
//     if (!user) return res.status(401).json({ message: "Invalid token" });
//     req.user = { id: user.id, role: user.role, username: user.username };
//     next();
//   } catch (err) {
//     return res
//       .status(401)
//       .json({ message: "Token invalid", error: err.message });
//   }
// };

exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) return res.status(401).json({ message: "No token provided" });

    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;

    let payload;
    try {
      payload = jwt.verify(token, config.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Token invalid" });
    }
    console.log(payload.sub);
    // ✅ Optional: skip DB call if token already contains user info
    const user = await Users.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      username: user.email_id,
    };

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).end();
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
