const reportService = require('../services/reportService');

exports.taskExcel = async (req, res, next) => {
  try {
    const buffer = await reportService.generateTasksExcel();
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) { next(err); }
};

exports.taskPdf = async (req, res, next) => {
  try {
    const buffer = await reportService.generateTasksPdf();
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (err) { next(err); }
};
