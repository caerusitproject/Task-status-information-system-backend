const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");
const { application } = require("express");
const { create } = require("handlebars");

const TaskStatusInfo = sequelize.define("taskStatusInfo", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  task_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  task_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  application_name:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ticket_id:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 percentage_complete:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  execution_note:{
    type: DataTypes.TEXT,
    allowNull: false,
    },
  created_by:{
    type: DataTypes.STRING,
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
  tableName: "taskStatusInfo",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = TaskStatusInfo;