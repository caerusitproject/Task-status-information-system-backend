const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const Application = sequelize.define(
  "application_module",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    app_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      default: "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      default: "CURRENT_TIMESTAMP",
    },
  },
  {
    tableName: "application_module",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Application;
