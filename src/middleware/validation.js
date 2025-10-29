const validateId = (req, res, next) => {
  if (!req.params.id) return res.status(400).send('ID required');
  next();
};

module.exports = { validateId };