const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    taskTitle: { type: DataTypes.STRING, allowNull: false },
    taskType: { type: DataTypes.STRING, allowNull: false },
    applicationName: { type: DataTypes.STRING, allowNull: false },
    module: { type: DataTypes.STRING },
    resolutionType: { type: DataTypes.STRING },
    resolutionDetails: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('New','In-Progress','Completed','Blocked'), defaultValue: 'New' },
    percentageComplete: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
    description: { type: DataTypes.TEXT },
    startTime: { type: DataTypes.DATE },
    endTime: { type: DataTypes.DATE }
  }, {
    tableName: 'tasks',
    timestamps: true
  });

  return Task;
};
