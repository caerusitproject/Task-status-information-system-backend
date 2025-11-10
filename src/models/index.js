const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
// const config = require('../../config/config').development;

// const sequelize = new Sequelize(config.url, { dialect: 'postgres', logging: false });

const dbInfo = {};

// ✅ Import all models
dbInfo.Users = require("./User");
dbInfo.Application = require("./Application");
dbInfo.TicketingSystem = require("./ticketingSystem");
dbInfo.TaskExecutionStatus = require("./taskExecutionStatus");
dbInfo.TaskStatusAuditTrail = require("./taskStatusAuditTrail");
dbInfo.TaskStatusInfo = require("./taskStatusInfo");
dbInfo.TaskDetail = require("./taskDetails");
dbInfo.Colors = require("./colors");

// 🧩 Debug: Log model import status
console.log("🧠 Model files loaded:");
Object.entries(dbInfo).forEach(([key, value]) => {
  if (value && typeof value.init === "function") {
    console.log(`   ✅ ${key} -> Sequelize model class detected`);
  } else {
    console.log(
      `   ⚠️  ${key} -> Not a Sequelize model class or missing init()`
    );
  }
});

// Associations
// User.hasMany(Task, { foreignKey: 'createdBy' });
// Task.belongsTo(User, { foreignKey: 'createdBy' });

// Task.hasMany(Audit, { foreignKey: 'taskId' });
// Audit.belongsTo(Task, { foreignKey: 'taskId' });

// ✅ Define associations
//
dbInfo.TaskExecutionStatus.belongsTo(dbInfo.Users, {
  foreignKey: "logged_user",
  as: "user",
});
dbInfo.Users.hasMany(dbInfo.TaskExecutionStatus, {
  foreignKey: "logged_user",
  as: "executed_tasks",
});

// TASK_STATUS_INFO ↔ TASK_STATUS_AUDIT_TRAIL

dbInfo.TaskStatusInfo.hasMany(dbInfo.TaskStatusAuditTrail, {
  as: "audit_trails",
  foreignKey: "task_status_id",
});
dbInfo.TaskStatusAuditTrail.belongsTo(dbInfo.TaskStatusInfo, {
  as: "taskstatusinfo",
  foreignKey: "task_status_id",
});

// TICKETING_SYSTEM ↔ TASK_STATUS_INFO
dbInfo.TaskStatusInfo.hasMany(dbInfo.TicketingSystem, {
  foreignKey: "ticket_id",
});
dbInfo.TicketingSystem.belongsTo(dbInfo.TaskStatusInfo, {
  foreignKey: "ticket_id",
});

// APPLICATION ↔ TICKETING_SYSTEM
dbInfo.Application.hasMany(dbInfo.TicketingSystem, {
  foreignKey: "app_id",
  as: "tickets",
});
dbInfo.TicketingSystem.belongsTo(dbInfo.Application, {
  foreignKey: "app_id",
  as: "application",
});

// TASK DETAIL ↔ TASK_STATUS_INFO

dbInfo.TaskStatusInfo.hasMany(dbInfo.TaskDetail, {
  foreignKey: "tstatusId",
  as: "taskstaskdetails",
});
dbInfo.TaskDetail.belongsTo(dbInfo.TaskStatusInfo, {
  foreignKey: "tstatusId",
  as: "taskstatusinfo",
});

// ✅ Attach Sequelize references at the end

// 🧩 Debug: Confirm all associations and model count
console.log("\n🔗 Associations and Sequelize initialized:");
console.log("   Models loaded:", Object.keys(dbInfo));
// ✅ Initialize sequelize on models if not already done
Object.values(dbInfo).forEach((model) => {
  if (model.init && !model.sequelize) {
    model.sequelize = sequelize;
  }
});
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ All models synced successfully"))
  .catch((err) => console.error("❌ Model sync failed:", err));

dbInfo.sequelize = sequelize;
dbInfo.Sequelize = Sequelize;

module.exports = dbInfo;

// module.exports = {
//   sequelize,
//   Sequelize,
//   User,
//   Task,
//   Setting,
//   Audit
// };
