const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const TaskStatusInfo = sequelize.define(
  "taskStatusInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_code: {
      type: DataTypes.STRING,
    },
    sr_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ticket_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requestedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    task_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    task_type: {
      type: DataTypes.ENUM(
        "assignment",
        "issue",
        "change_request",
        "ticket_less"
      ),
      allowNull: false,
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ticketing_system_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    statement_of_the_issue: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    color_row: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "taskStatusInfo",
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ✅ Hook to generate `task_code` based on `task_type` & auto-incremented `id`
TaskStatusInfo.addHook("afterCreate", async (task) => {
  let prefix;

  switch (task.task_type) {
    case "assignment":
      prefix = "AS";
      break;
    case "issue":
      prefix = "IS";
      break;
    case "change_request":
      prefix = "CR";
      break;
    case "ticket_less":
      prefix = "TL";
      break;
  }

  const formattedId = task.id.toString().padStart(2, "0"); // 1 → 01
  const newCode = `${prefix}-${formattedId}`;

  await task.update({ task_code: newCode });
});

module.exports = TaskStatusInfo;
