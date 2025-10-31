const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const Application = sequelize.define("application", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  description:{
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
 
}, {
  tableName: "application_info",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = Application;