const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

const Colors = sequelize.define(
  "colors",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
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
  },
  {
    tableName: "colors",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Colors;
