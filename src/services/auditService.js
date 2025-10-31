const { Audit } = require('../models');

exports.logCreate = async (task, username) => {
  await Audit.create({
    taskId: task.id,
    changedField: 'CREATE',
    oldValue: null,
    newValue: JSON.stringify(task),
    changedBy: username
  });
};

exports.logUpdate = async (task, old, username) => {
  const changed = [];
  const newObj = task.toJSON();
  Object.keys(newObj).forEach(k => {
    if (old[k] != newObj[k]) changed.push({ field: k, old: old[k], new: newObj[k] });
  });
  for (const c of changed) {
    await Audit.create({
      taskId: task.id,
      changedField: c.field,
      oldValue: c.old && c.old.toString(),
      newValue: c.new && c.new.toString(),
      changedBy: username
    });
  }
};
