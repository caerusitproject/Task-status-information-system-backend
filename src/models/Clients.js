const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const Application = sequelize.define(
  "clients_info",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
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
    tableName: "clients_info",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Application;
