const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

const TicketingSystem = sequelize.define("ticketingSystem", {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticket_status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  app_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ticket_name:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  ticket_description: {
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