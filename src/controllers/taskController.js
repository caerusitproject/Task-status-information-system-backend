const express = require('express');
const { Task } = require('../models');
const auditService = require('../services/auditService');
const { authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user.id;
    if (payload.status === 'Completed' && payload.percentageComplete < 100) {
      return res.status(400).json({ message: 'Completed tasks must have 100% completion' });
    }
    if (!payload.startTime) payload.startTime = new Date();
    const task = await Task.create(payload);
    await auditService.logCreate(task, req.user.username);
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ order: [['updatedAt','DESC']] });
    res.json(tasks);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    const old = t.toJSON();
    await t.update(req.body);
    await auditService.logUpdate(t, old, req.user.username);
    res.json(t);
  } catch (err) { next(err); }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const t = await Task.findByPk(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    await t.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = { router };
