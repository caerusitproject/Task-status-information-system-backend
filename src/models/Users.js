const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

const Users = sequelize.define(
  "user_info",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_Active: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "false",
    },
    // auth_key: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      // references: {
      //   model: "Roles",
      //   key: "name",
      // },
    },
  },
  {
    tableName: "user_info",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Users;
