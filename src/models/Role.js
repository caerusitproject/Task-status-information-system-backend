const { DataTypes } = require("sequelize");
const sequelize = require("../db");


const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Example: "Admin", "User"
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Example: "Admin", "User"
  },
}, {
  tableName: "Roles",
  timestamps: true,
});

module.exports = Role;