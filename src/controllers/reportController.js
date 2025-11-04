const reportService = require('../services/reportService');
const {generateWeeklySummaryPDF} = require('../util/pdfgenerator')
const {getStartAndEndOfMonth} = require('../util/modifiers')
const path = require("path");
const fs = require("fs");


exports.taskExcel = async (req, res, next) => {
  try {
    const buffer = await reportService.generateTasksExcel();
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) { next(err); }
};


// exports.taskPdf = async (req, res, next) => {
//   try {
//     const weeklySummary = await reportService.getWeeklyStatusSummary(req.body);
//     const { startDate, endDate } = req.body;

//     const reportData = { startDate, endDate, weeklySummary };

//     const pdfBuffer = await generateWeeklySummaryPDF(reportData);

//     res.setHeader("Content-Disposition", 'attachment; filename="Weekly_Task_Summary.pdf"');
//     res.setHeader("Content-Type", "application/pdf");
//     res.send(pdfBuffer);
//   } catch (err) {
//     next(err);
//   }
// };


// exports.taskPdf = async (req, res, next) => {
//   try {
//     const weeklySummary = await reportService.getWeeklyStatusSummary(req.body);
//     const start_date=req.body.startDate
//     const end_date=req.body.endDate
//     const reportData = {
//     start_date,
//     end_date,
//     weeklySummary,
//   };

//   await generateWeeklySummaryPDF(reportData, "./Weekly_Task_Summary.pdf");
//     res.setHeader('Content-Disposition', 'attachment; filename="tasks.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');
//     res.send(weeklySummary);
//   } catch (err) { next(err); }
// };



exports.taskPdf = async (req, res, next) => {
  try {
    // Extract body params
    const { year, month } = req.body;
    const {startDate,endDate}= getStartAndEndOfMonth(year,month)

    // 1️⃣ Fetch data
    const weeklySummary = await reportService.getWeeklyStatusSummary(startDate,endDate);

    // 2️⃣ Prepare the report data

    console.log('path____________',weeklySummary)
    
    const reportData = {
      startDate,
      endDate,
      weeklySummary,
    };
    if(weeklySummary && weeklySummary.length == 0 ){
       res.status(403).json({message: "Pdf Cannot be generated", status: 403});
    }
    // 3️⃣ Define a valid file path
    const filePath = path.join(__dirname, "../reports/Weekly_Task_Summary.pdf");
    // Ensure folder exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // 4️⃣ Generate the PDF
    await generateWeeklySummaryPDF(reportData, filePath);

    // 5️⃣ Stream it to the response
    res.setHeader("Content-Disposition", 'attachment; filename="Weekly_Task_Summary.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error generating PDF:", err);
    next(err);
  }
};
