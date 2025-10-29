const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true

  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Foreign key to link to the User model
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'user', // Name of the User model/table
      key: 'id',
    },
  },
  empId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employee', // Name of the User model/table
      key: 'id',
    },
  },
}, {
  tableName: "refreshtoken",
  timestamps: true
});


module.exports = RefreshToken;