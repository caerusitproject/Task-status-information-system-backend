const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

const TaskStatusAuditTrail = sequelize.define("taskStatusAuditTrail", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  task_status_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  changed_field: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  new_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  old_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  changed_by:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  changed_at: {
    type: DataTypes.DATE,
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
 
}, {
  tableName: "taskStatusAuditTrail",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = TaskStatusAuditTrail;