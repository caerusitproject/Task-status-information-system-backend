const ReportService = require("../services/reportService");
const { generateWeeklySummaryPDF } = require("../util/pdfgenerator");
const {
  generateTimeSheetExcelFromReport,
  generateTimeSheetPDFFromReport,
  generateTaskViewPDFFromReport,
  generateTaskViewExcelFromReport,
} = require("../util/modifiers");
// const path = require("path");
// const fs = require("fs");

exports.taskExcel = async (req, res, next) => {
  try {
    const buffer = await reportService.generateTasksExcel();
    res.setHeader("Content-Disposition", 'attachment; filename="tasks.xlsx"');
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
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

const createReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.createReportInfo(req.body);
    res
      .status(newStatusInfo.status)
      .json({ message: newStatusInfo.message, status: newStatusInfo.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.getReportInfo(req.query);
    res.status(newStatusInfo.status).json({
      count: newStatusInfo.totalRecords,
      rows: newStatusInfo.rows,
      totalPages: newStatusInfo.totalPages,
      currentPage: newStatusInfo.currentPage,
      nextPage: newStatusInfo.nextPage,
      previousPage: newStatusInfo.previousPage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExcelTimeSheetReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.getTimeSheetDetails(
      req.body.startDate,
      req.body.endDate
    );

    if (newStatusInfo && newStatusInfo.length == 0) {
      res
        .status(403)
        .json({ message: "Excel Cannot be generated", status: 403 });
      return;
    }

    // This returns a Buffer
    const excelBuffer = await generateTimeSheetExcelFromReport(newStatusInfo);

    // Set headers so browser knows it's a file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=timesheet.xlsx");

    // Send buffer directly
    res.status(200).send(excelBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPDFTimeSheetReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.getTimeSheetDetails(
      req.body.startDate,
      req.body.endDate
    );
    console.log("pdf time sheet_______", newStatusInfo);

    if (newStatusInfo && newStatusInfo.length == 0) {
      res.status(403).json({ message: "Pdf cannot be generated", status: 403 });
      return;
    }
    // ✅ Generate PDF buffer
    const pdfBuffer = await generateTimeSheetPDFFromReport(newStatusInfo);

    // ✅ Send as downloadable PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=timesheet.pdf");

    res.status(200).send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPDFTaskSheetReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.getTimeSheetDetails(
      req.body.startDate,
      req.body.endDate
    );
    console.log("pdf time sheet_______", newStatusInfo);

    if (newStatusInfo && newStatusInfo.length == 0) {
      res.status(403).json({ message: "Pdf Cannot be generated", status: 403 });
      return;
    }
    // ✅ Generate PDF buffer
    const pdfBuffer = await generateTaskViewPDFFromReport(newStatusInfo);

    // ✅ Send as downloadable PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=timesheet.pdf");

    res.status(200).send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExcelTaskSheetReport = async (req, res) => {
  try {
    const newStatusInfo = await ReportService.getTimeSheetDetails(
      req.body.startDate,
      req.body.endDate
    );
    console.log("excel task sheet_______", newStatusInfo);
    // ✅ Generate PDF buffer
    const excelBuffer = await generateTaskViewExcelFromReport(newStatusInfo);

    if (newStatusInfo && newStatusInfo.length == 0) {
      res
        .status(403)
        .json({ message: "Excel Cannot be generated", status: 403 });
      return;
    }

    // ✅ Send as downloadable PDF
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=timesheet.xlsx");

    res.status(200).send(excelBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.taskPdf = async (req, res, next) => {
//   try {
//     // Extract body params
//     // const { year, month } = req.body;
//     // const { startDate, endDate } = getStartAndEndOfMonth(year, month);
//      const { startDate, endDate } = req.query;
//     // 1️⃣ Fetch data
//     const weeklySummary = await reportService.getWeeklyStatusSummary(
//       startDate,
//       endDate
//     );

//     // 2️⃣ Prepare the report data

//     console.log("path____________", weeklySummary);

//     const reportData = {
//       startDate,
//       endDate,
//       weeklySummary,
//     };
//     if (weeklySummary && weeklySummary.length == 0) {
//       res.status(403).json({ message: "Pdf Cannot be generated", status: 403 });
//     }
//     // 3️⃣ Define a valid file path
//     const filePath = path.join(__dirname, "../reports/Weekly_Task_Summary.pdf");
//     // Ensure folder exists
//     fs.mkdirSync(path.dirname(filePath), { recursive: true });

//     // 4️⃣ Generate the PDF
//     await generateWeeklySummaryPDF(reportData, filePath);

//     // 5️⃣ Stream it to the response
//     res.setHeader(
//       "Content-Disposition",
//       'attachment; filename="Weekly_Task_Summary.pdf"'
//     );
//     res.setHeader("Content-Type", "application/pdf");

//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     next(err);
//   }
// };

module.exports = {
  createReport,
  viewReport,
  createExcelTimeSheetReport,
  createPDFTimeSheetReport,
  createPDFTaskSheetReport,
  createExcelTaskSheetReport,
};
