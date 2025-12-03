const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT }
  }, {
    tableName: 'settings',
    timestamps: true
  });

  return Setting;
};
