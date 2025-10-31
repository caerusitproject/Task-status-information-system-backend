module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define('Audit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    taskId: { type: DataTypes.UUID, allowNull: false },
    changedField: { type: DataTypes.STRING },
    oldValue: { type: DataTypes.TEXT },
    newValue: { type: DataTypes.TEXT },
    changedBy: { type: DataTypes.STRING },
  }, {
    tableName: 'audits',
    timestamps: true
  });

  return Audit;
};
