const fs = require("fs");
const PDFDocument = require("pdfkit");

exports.generateWeeklySummaryPDF = async (data, filePath) => {
  const doc = new PDFDocument({ margins: { top: 60, bottom: 40, left: 50, right: 50 }, });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // ───────────────────────────────
  // HEADER
  // ───────────────────────────────
  doc.font("Helvetica-Bold").fontSize(18).text("Weekly Summary Report", { align: "center" });
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(12)
    .text(`Duration: ${data.startDate} to ${data.endDate}`)
    .text(`Generated On: ${new Date().toLocaleDateString("en-GB")}`)
    .moveDown(1.5);

  // ───────────────────────────────
  // TABLE CONFIG
  // ───────────────────────────────
  const startY = doc.y;
  const rowHeight = 22;
  const colX = {
    week: 40,
    total: 130,
    completed: 230,
    inProgress: 330,
    blocked: 430,
    hours: 520,
  };

  // ───────────────────────────────
  // TABLE HEADER
  // ───────────────────────────────
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Week Start", colX.week, startY, { width: 100 });
  doc.text("Total Tasks", colX.total, startY, { width: 100 });
  doc.text("Completed", colX.completed, startY, { width: 100 });
  doc.text("In Progress", colX.inProgress, startY, { width: 100 });
  doc.text("Blocked", colX.blocked, startY, { width: 100 });
  doc.text("Total Hours", colX.hours, startY, { width: 100, align: "left" });

  // Header line
  doc.moveTo(colX.week, startY + 15)
     .lineTo(640, startY + 15)
     .strokeColor("#000")
     .lineWidth(1)
     .stroke();

  doc.moveDown(0.5);

  // ───────────────────────────────
  // TABLE ROWS
  // ───────────────────────────────
  let currentY = startY + 25;
  doc.font("Helvetica").fontSize(11);

  if (Array.isArray(data.weeklySummary) && data.weeklySummary.length > 0) {
    data.weeklySummary.forEach((week) => {
      doc.text(week.week_start_date, colX.week, currentY, { width: 100 });
      doc.text(String(week.total_records_in_week || 0), colX.total, currentY, { width: 80, align: "center" });
      doc.text(String(week.completed_count || 0), colX.completed, currentY, { width: 80, align: "center" });
      doc.text(String(week.in_progress_count || 0), colX.inProgress, currentY, { width: 80, align: "center" });
      doc.text(String(week.blocked_count || 0), colX.blocked, currentY, { width: 80, align: "center" });
      doc.text((week.total_work_hours?.toFixed(1) || "0.0"), colX.hours, currentY, { width: 80, align: "center" });
      currentY += rowHeight;
    });
  } else {
    doc.moveDown(1).font("Helvetica-Oblique").text("No data available for this period.", { align: "center" });
  }

  // ───────────────────────────────
  // TOTAL ROW
  // ───────────────────────────────
  if (data.weeklySummary?.length) {
    const totals = data.weeklySummary.reduce(
      (acc, w) => {
        acc.total += w.total_records_in_week || 0;
        acc.completed += w.completed_count || 0;
        acc.inProgress += w.in_progress_count || 0;
        acc.blocked += w.blocked_count || 0;
        acc.hours += w.total_work_hours || 0;
        return acc;
      },
      { total: 0, completed: 0, inProgress: 0, blocked: 0, hours: 0 }
    );

    doc.moveTo(colX.week, currentY)
       .lineTo(640, currentY)
       .strokeColor("#000")
       .lineWidth(1)
       .stroke();

    currentY += 10;
    doc.font("Helvetica-Bold");

    doc.text("TOTAL", colX.week, currentY, { width: 100 });
    doc.text(String(totals.total), colX.total, currentY, { width: 80, align: "center" });
    doc.text(String(totals.completed), colX.completed, currentY, { width: 80, align: "center" });
    doc.text(String(totals.inProgress), colX.inProgress, currentY, { width: 80, align: "center" });
    doc.text(String(totals.blocked), colX.blocked, currentY, { width: 80, align: "center" });
    doc.text(totals.hours.toFixed(1), colX.hours, currentY, { width: 80, align: "center" });
  }

  // ───────────────────────────────
  // FOOTER
  // ───────────────────────────────
  doc.moveDown(2);
  // doc.font("Helvetica").fontSize(12)
  //   .text("Manager Review: ✓ Approved / ✗ Rework Needed", {
  //     align: "left",
  //     continued: false,
  //     width: 500, // prevents wrapping
  //   });

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
