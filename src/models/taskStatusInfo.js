const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");
const { application } = require("express");
const { create } = require("handlebars");

const TaskStatusInfo = sequelize.define("taskStatusInfo", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    ticket_id:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  task_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  task_type: {
    type: DataTypes.ENUM('Assign','Issue'), defaultValue: 'Assign' ,
    allowNull: false,
  },
  application_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ticketing_system_id:{
  type: DataTypes.INTEGER,
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  execution_note:{
    type: DataTypes.TEXT,
    allowNull: false,
    },
  created_by:{
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
 
}, {
  tableName: "taskStatusInfo",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = TaskStatusInfo;