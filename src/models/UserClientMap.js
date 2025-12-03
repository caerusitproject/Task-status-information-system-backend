const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const UserClientMap = sequelize.define(
  "user_client_map",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
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
    tableName: "user_client_map",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = UserClientMap;
