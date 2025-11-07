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
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    task_type: {
      type: DataTypes.ENUM("Assign", "Issue", "Change Request", "Ticket Less"), // ✅ no custom name
      allowNull: false,
    },
    daily_accomplishment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rca_investigation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolution_and_steps: {
      type: DataTypes.TEXT,
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
