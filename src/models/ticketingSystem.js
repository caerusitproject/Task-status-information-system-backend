const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/db");

const TicketingSystem = sequelize.define("ticketingSystem", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticketing_system_name:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  ticketing_system_description: {
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
 
}, {
  tableName: "ticketingSystem",
  timestamps: false,
  underscored: true,
  freezeTableName: true
});



module.exports = TicketingSystem;