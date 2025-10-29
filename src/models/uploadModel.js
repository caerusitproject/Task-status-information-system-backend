const { DataTypes } = require('sequelize');
const sequelize = require('../db');

 const Upload = sequelize.define("Upload", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "uploads",
    timestamps: false, // since we are using uploaded_at instead
  });

  // Associations
  /*Upload.associate = (models) => {
    Upload.belongsTo(models.Employee, {
      foreignKey: "employee_id",
      onDelete: "CASCADE",
    });
  });*/

module.exports = Upload;