const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("user", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Roles",
      key: "id",
    },
  },
 
}, {
  tableName: "user",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = User;