const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const TaskDetail = sequelize.define(
  "taskDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tstatusId: {
      type: DataTypes.INTEGER,
      references: {
        model: "taskStatusInfo",
        key: "id",
      },
      // onDelete: "CASCADE", // optional but good practice
      allowNull: false,
    },
    app_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    module_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_info",
        key: "id",
      },
    },
    client_id: {
      type: DataTypes.STRING,
      allowNull: true,
      // references: {
      //   model: "clients_info",
      //   key: "id",
      // },
    },
    sr_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    report_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hour: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    minute: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    task_type: {
      type: DataTypes.ENUM(
        "assignment",
        "issue",
        "change_request",
        "ticket_less"
      ), // ✅ no custom name
      allowNull: false,
    },
    daily_accomplishment: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    rca_investigation: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    resolution_and_steps: {
      type: DataTypes.TEXT("long"),
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
    tableName: "taskDetail",
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: "created_at", // ✅ map to your snake_case field
    updatedAt: "updated_at",
  }
);

module.exports = TaskDetail;
