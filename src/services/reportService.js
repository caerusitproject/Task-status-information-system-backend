const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Task, User } = require('../models');
const streamBuffers = require('stream-buffers');

exports.generateTasksExcel = async () => {
  const tasks = await Task.findAll({ order: [['createdAt','DESC']] });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Tasks');

  ws.columns = [
    { header: 'Task ID', key: 'id', width: 36 },
    { header: 'Title', key: 'taskTitle', width: 30 },
    { header: 'Type', key: 'taskType', width: 15 },
    { header: 'Application', key: 'applicationName', width: 20 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: '% Complete', key: 'percentageComplete', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 22 }
  ];

  tasks.forEach(t => {
    ws.addRow({
      id: t.id,
      taskTitle: t.taskTitle,
      taskType: t.taskType,
      applicationName: t.applicationName,
      module: t.module,
      status: t.status,
      percentageComplete: t.percentageComplete,
      createdBy: t.createdBy,
      createdAt: t.createdAt
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

exports.generateTasksPdf = async () => {
  const tasks = await Task.findAll({ order: [['createdAt','DESC']] });
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  const writable = new streamBuffers.WritableStreamBuffer();

  doc.fontSize(16).text('Tasks Report', { align: 'center' }).moveDown();

  tasks.forEach((t, idx) => {
    doc.fontSize(12).text(`${idx+1}. ${t.taskTitle} [${t.status}]`);
    doc.fontSize(10).text(`Type: ${t.taskType} | App: ${t.applicationName} | Module: ${t.module}`);
    doc.fontSize(10).text(`% Complete: ${t.percentageComplete} | Created At: ${t.createdAt}`);
    doc.moveDown(0.5);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.pipe(writable);
    writable.on('finish', () => {
      const buffer = writable.getContents();
      resolve(buffer);
    });
    writable.on('error', reject);
  });
};
