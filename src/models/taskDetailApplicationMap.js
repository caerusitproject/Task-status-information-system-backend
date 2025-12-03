const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const TaskDetailApplicationMap = sequelize.define(
  "task_detail_application_map",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "task_detail_application_map",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = TaskDetailApplicationMap;
