const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Permission = sequelize.define("Permission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  });
module.exports = Permission;