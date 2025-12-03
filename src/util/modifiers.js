const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const moment = require("moment");
exports.generateFourWeekRanges = (dateStr, page = 1) => {
  const inputDate = new Date(dateStr);

  // Find Monday of that week
  const day = inputDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(inputDate);
  monday.setDate(monday.getDate() + diffToMonday);

  // Each "page" shifts by 4 weeks (28 days)
  const offsetDays = (page - 1) * 28;
  monday.setDate(monday.getDate() + offsetDays);

  const result = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Friday (Start + 4 days)

    const format = (d) => d.toISOString().split("T")[0];

    result.push({
      week: i + 1 + (page - 1) * 4, // Week numbering continues across pages
      startDate: format(weekStart),
      endDate: format(weekEnd),
    });
  }

  if (page < 1) {
    result.reverse();
  }

  return result;
};

exports.getNextDate = (dateString) => {
  const date = new Date(dateString);

  // Add 1 day
  date.setDate(date.getDate() + 1);

  // Format YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// exports.extractQueries = (htmlText) => {
//   if (!htmlText) return [];

//   // 1. Extract all <td> blocks that appear under "Query"
//   const queryBlocks = [
//     ...htmlText.matchAll(
//       /<strong>Query<\/strong><\/td><\/tr>\s*<tr><td>([\s\S]*?)<\/td>/gi
//     ),
//   ];

//   const extractedQueries = [];

//   for (const block of queryBlocks) {
//     const raw = block[1];

//     // 2. Remove HTML tags
//     let cleaned = raw.replace(/<[^>]+>/g, "");

//     // 3. Normalize spacing
//     cleaned = cleaned.replace(/\s+/g, " ").trim();

//     // 4. Split into individual SQL statements if needed
//     const statements = cleaned.split(/(?=SELECT)/gi); // split at the word SELECT

//     extractedQueries.push(...statements.map((s) => s.trim()));
//   }

//   return extractedQueries;
// };

exports.extractQueries = (htmlText) => {
  if (!htmlText) return [];

  const queryBlocks = [
    ...htmlText.matchAll(
      /<strong>Query<\/strong><\/td><\/tr>\s*<tr><td>([\s\S]*?)<\/td>/gi
    ),
  ];

  const extractedQueries = [];

  for (const block of queryBlocks) {
    let cleaned = block[1];

    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, "");

    // Decode common HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");

    // CRITICAL: Remove ALL backslashes FIRST and aggressively
    cleaned = cleaned.replace(/\\/g, "");

    // Fix common escaped quotes that become broken after backslash removal
    // e.g. "module" -> module", then fix to "module"
    cleaned = cleaned.replace(/"(\s*[\w]+)"(\s*[=,)])/g, '"$1"$2'); // shouldn't be needed if \ is gone
    // But more importantly, sometimes you get: "module" -> module" after \ removal
    // So let's fix broken quotes around identifiers:
    cleaned = cleaned.replace(/="\s*;/g, ' = "'); // fix "; to "
    cleaned = cleaned.replace(/;"(\s*[\w\."]+)/g, ' "$1'); // fix leading ";
    cleaned = cleaned.replace(/(\w)"\s*([=)])/g, '$1" $2'); // fix missing " after word

    // Alternative strong fix: re-quote identifiers that clearly should be quoted
    // This handles the specific broken pattern: = ";module" -> = "module"
    cleaned = cleaned.replace(/=\s*";/g, ' = "');
    cleaned = cleaned.replace(/;"/g, ' "');

    // Remove extra spaces and normalize
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Split into individual SQL statements starting with SELECT
    const sqlStatements = cleaned.split(/(?=SELECT)/gi);

    for (let stmt of sqlStatements) {
      stmt = stmt.trim();
      if (stmt) {
        extractedQueries.push(stmt);
      }
    }
  }

  return extractedQueries;
};

exports.cleanSQL = (sql) => {
  if (!sql) return "";

  return sql
    .replace(/&nbsp;/g, " ")
    .replace(/;\"module/g, '"module')
    .replace(/\";\"module/g, '"module')
    .replace(/LEFT OUTER JOIN/g, " LEFT OUTER JOIN ")
    .replace(/FROM/g, " FROM ")
    .replace(/\s+/g, " ")
    .trim();
};

exports.generateTimeSheetExcelFromReport = async (data) => {
  // ────────────────────────────────────────────────
  // STEP 1 — CLEAN THE DATA (same as PDF)
  // ────────────────────────────────────────────────
  const cleanedData = data.map((item) => ({
    ...item,

    module_names: item.module_names
      ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    report_names: item.report_names
      ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    daily_accomplishment: item.daily_accomplishment
      ? (() => {
          const html = item.daily_accomplishment;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  // ────────────────────────────────────────────────
  // STEP 1.5 — GROUP BY DATE
  // ────────────────────────────────────────────────
  const grouped = {};

  cleanedData.forEach((item) => {
    const raw = item.date ?? item.created_at ?? item.createdAt;
    let dateKey = "Unknown Date";

    if (raw != null) {
      if (typeof raw === "string") {
        dateKey = raw.includes("T") ? raw.split("T")[0] : raw.trim();
      } else if (raw instanceof Date) {
        dateKey = raw.toISOString().split("T")[0];
      } else if (typeof raw === "number") {
        dateKey = new Date(raw).toISOString().split("T")[0];
      } else {
        try {
          const d = new Date(raw);
          dateKey = !isNaN(d.getTime())
            ? d.toISOString().split("T")[0]
            : String(raw);
        } catch {
          dateKey = String(raw);
        }
      }
    }

    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  // ────────────────────────────────────────────────
  // STEP 2 — CREATE EXCEL
  // ────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Time Sheet Report");

  ws.columns = [
    { key: "task_id", width: 20 },
    { key: "task_type", width: 20 },
    { key: "combined", width: 60 },
    { key: "time_spent", width: 15 },
  ];

  let excelRowIndex = 1;

  // ────────────────────────────────────────────────
  // STEP 3 — WRITE GROUPED BY DATE
  // ────────────────────────────────────────────────
  for (const date of Object.keys(grouped)) {
    // DATE HEADER ROW
    const dateRow = ws.addRow([date]);
    dateRow.font = { bold: true, size: 14 };
    dateRow.height = 22;

    ws.mergeCells(`A${excelRowIndex}:D${excelRowIndex}`);
    excelRowIndex++;

    // COLUMN HEADER ROW (appears after each date)
    const headerRow = ws.addRow([
      "Task ID",
      "Task Type",
      "Details",
      "Time Spent",
    ]);

    headerRow.font = { bold: true };
    headerRow.height = 18;

    // Add borders to header cells
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    excelRowIndex++;

    // TASK ROWS
    grouped[date].forEach((item) => {
      const combinedField = [
        item.daily_accomplishment,
        item.rca_investigation,
        item.resolution_and_steps,
      ]
        .filter(Boolean)
        .join("\n\n");

      const timeSpent =
        `${item.hour ? item.hour + " hrs" : ""} ` +
        `${item.minute ? item.minute + " mins" : ""}`.trim();

      const row = ws.addRow({
        task_id: item.task_id,
        task_type: item.task_type,
        combined: combinedField,
        time_spent: timeSpent,
      });

      // WRAP TEXT
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: "top" };
      });

      // BACKGROUND COLOR
      let bg = item.color_row || null;
      if (bg) {
        bg = bg.replace("#", "").toUpperCase();
        if (bg.length === 6) bg = "FF" + bg;

        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bg },
          };
        });
      }

      // BORDER
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      excelRowIndex++;
    });

    excelRowIndex++; // spacing
  }

  // ────────────────────────────────────────────────
  // RETURN EXCEL BUFFER
  // ────────────────────────────────────────────────
  return await wb.xlsx.writeBuffer();
};

// exports.generateTasksExcelFromReport = async (data) => {
//   const ExcelJS = require("exceljs");

//   // ────────────────────────────────────────────────
//   // STEP 1 — CLEAN THE DATA (same as PDF)
//   // ────────────────────────────────────────────────
//   const cleanedData = data.map((item) => ({
//     ...item,

//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   // ────────────────────────────────────────────────
//   // STEP 1.5 — GROUP BY DATE (same as PDF)
//   // ────────────────────────────────────────────────
//   const grouped = {};

//   cleanedData.forEach((item) => {
//     const raw = item.date ?? item.created_at ?? item.createdAt;

//     let dateKey = "Unknown Date";

//     if (raw != null) {
//       if (typeof raw === "string") {
//         dateKey = raw.includes("T") ? raw.split("T")[0] : raw.trim();
//       } else if (raw instanceof Date) {
//         dateKey = raw.toISOString().split("T")[0];
//       } else if (typeof raw === "number") {
//         dateKey = new Date(raw).toISOString().split("T")[0];
//       } else {
//         try {
//           const d = new Date(raw);
//           dateKey = !Number.isNaN(d.getTime())
//             ? d.toISOString().split("T")[0]
//             : String(raw);
//         } catch {
//           dateKey = String(raw);
//         }
//       }
//     }

//     if (!grouped[dateKey]) grouped[dateKey] = [];
//     grouped[dateKey].push(item);
//   });

//   // ────────────────────────────────────────────────
//   // STEP 2 — CREATE EXCEL WORKBOOK
//   // ────────────────────────────────────────────────
//   const wb = new ExcelJS.Workbook();
//   const ws = wb.addWorksheet("Task Report");

//   // ────────────────────────────────────────────────
//   // TABLE COLUMNS (same structure as PDF table)
//   // ────────────────────────────────────────────────
//   // ws.columns = [
//   //   { header: "Task ID", key: "task_id", width: 20 },
//   //   { header: "Task Type", key: "task_type", width: 20 },
//   //   { header: "Combined Fields", key: "combined", width: 60 },
//   //   { header: "Time Spent", key: "time_spent", width: 15 },
//   // ];

//   ws.getRow(1).font = { bold: true };

//   // ────────────────────────────────────────────────
//   // STEP 3 — WRITE ROWS GROUPED BY DATE
//   // ────────────────────────────────────────────────
//   let excelRowIndex = 2;

//   for (const date of Object.keys(grouped)) {
//     // DATE HEADER ROW (full-width)
//     const dateRow = ws.addRow([date]);
//     dateRow.font = { bold: true, size: 14 };
//     dateRow.height = 22;

//     // merge full row for date header
//     ws.mergeCells(`A${excelRowIndex}:D${excelRowIndex}`);
//     excelRowIndex++;

//     // ADD DATA ROWS
//     grouped[date].forEach((item) => {
//       const combinedField = [
//         item.daily_accomplishment,
//         item.rca_investigation,
//         item.resolution_and_steps,
//       ]
//         .filter(Boolean)
//         .join("\n\n");

//       const timeSpent =
//         `${item.hour ? item.hour + " hrs" : ""} ` +
//         `${item.minute ? item.minute + " mins" : ""}`.trim();

//       ws.columns = [
//         { header: "Task ID", key: "task_id", width: 20 },
//         { header: "Task Type", key: "task_type", width: 20 },
//         { header: "Combined Fields", key: "combined", width: 60 },
//         { header: "Time Spent", key: "time_spent", width: 15 },
//       ];
//       ws.addRow({
//         task_id: item.task_id,
//         task_type: item.task_type,
//         combined: combinedField,
//         time_spent: timeSpent,
//       });

//       const row = ws.getRow(excelRowIndex);

//       // MULTILINE WRAP
//       row.eachCell((cell) => {
//         cell.alignment = {
//           wrapText: true,
//           vertical: "top",
//         };
//       });

//       // ROW COLOR (same as PDF logic)
//       let bg = item.color_row || null;
//       if (bg) {
//         bg = bg.replace("#", "").toUpperCase();
//         if (bg.length === 6) bg = "FF" + bg;

//         row.eachCell((c) => {
//           c.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: bg },
//           };
//         });
//       }

//       // BORDERS
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           bottom: { style: "thin" },
//           right: { style: "thin" },
//         };
//       });

//       row.commit();
//       excelRowIndex++;
//     });

//     excelRowIndex++; // spacing between date sections
//   }

//   // ────────────────────────────────────────────────
//   // RETURN BUFFER
//   // ────────────────────────────────────────────────
//   return await wb.xlsx.writeBuffer();
// };

// exports.generateTasksExcelFromReport = async (data) => {
//   // Step 1 — Clean the data
//   const cleanedData = data.map((item) => ({
//     ...item,
//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   // Step 2 — Create Excel
//   const wb = new ExcelJS.Workbook();
//   const ws = wb.addWorksheet("Task Report");

//   ws.columns = [
//     { header: "Task ID", key: "task_id", width: 20 },
//     { header: "Application ID", key: "app_id", width: 15 },
//     { header: "Application Name", key: "application_name", width: 20 },
//     { header: "Module Names", key: "module_names", width: 35 },
//     { header: "SR No", key: "sr_no", width: 15 },
//     { header: "Ticket Id", key: "ticket_id", width: 15 },
//     { header: "Report Names", key: "report_names", width: 35 },
//     { header: "Hour", key: "hour", width: 10 },
//     { header: "Minute", key: "minute", width: 10 },
//     { header: "Task Type", key: "task_type", width: 18 },
//     { header: "Daily Accomplishment", key: "daily_accomplishment", width: 40 },
//     { header: "RCA Investigation", key: "rca_investigation", width: 40 },
//     { header: "Resolution and Steps", key: "resolution_and_steps", width: 40 },
//     { header: "Created At", key: "created_at", width: 25 },
//     { header: "Updated At", key: "updated_at", width: 25 },
//   ];

//   // Make header bold
//   ws.getRow(1).eachCell((cell) => {
//     cell.font = { bold: true };
//   });

//   // Step 3 — Add rows
//   cleanedData.forEach((item) => {
//     ws.addRow({
//       task_id: item.task_id,
//       app_id: item.app_id,
//       application_name: item.application_name,
//       module_names: item.module_names,
//       sr_no: item.sr_no,
//       report_names: item.report_names,
//       hour: item.hour,
//       minute: item.minute,
//       ticket_id: item.ticket_id,
//       task_type: item.task_type,
//       daily_accomplishment: item.daily_accomplishment,
//       rca_investigation: item.rca_investigation,
//       resolution_and_steps: item.resolution_and_steps,
//       created_at: item.created_at
//         ? new Date(item.created_at).toLocaleString()
//         : "",
//       updated_at: item.updated_at
//         ? new Date(item.updated_at).toLocaleString()
//         : "",
//     });
//   });

//   // ⭐ STEP X — Apply dynamic row background color + borders (covers blank cells)
//   ws.eachRow((row, rowNumber) => {
//     if (rowNumber === 1) return; // skip header row

//     const originalItem = cleanedData[rowNumber - 2]; // map row to data index

//     // Dynamic background color
//     let rowColor = originalItem?.color_row || null;
//     if (rowColor) {
//       rowColor = rowColor.replace("#", "").toUpperCase();
//       if (rowColor.length === 6) rowColor = "FF" + rowColor; // RGB → ARGB
//     }

//     // Loop through ALL columns so even empty/undefined cells get colored + bordered
//     ws.columns.forEach((col, colIndex) => {
//       const cell = row.getCell(colIndex + 1); // ensure the cell exists

//       // 🟦 Background Color
//       if (rowColor) {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: rowColor },
//         };
//       }

//       // 🟥 Borders for every cell
//       cell.border = {
//         top: { style: "thin" },
//         bottom: { style: "thin" },
//         left: { style: "thin" },
//         right: { style: "thin" },
//       };
//     });
//   });

//   // Step 5 — Send Excel buffer
//   const buf = await wb.xlsx.writeBuffer();
//   return buf;
// };

exports.generateTimeSheetPDFFromReport = async (data) => {
  const PDFDocument = require("pdfkit");

  // ────────────────────────────────────────────────
  // COLUMN WIDTHS (3 columns)
  // ────────────────────────────────────────────────
  const colWidths = [80, 250, 750, 100];

  // ────────────────────────────────────────────────
  // STEP 1: CLEAN + EXTRACT TEXT
  // ────────────────────────────────────────────────
  const cleanedData = data.map((item) => ({
    ...item,

    module_names: item.module_names
      ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    report_names: item.report_names
      ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    daily_accomplishment: item.daily_accomplishment
      ? (() => {
          const html = item.daily_accomplishment;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  // ────────────────────────────────────────────────
  // STEP 1.5: GROUP BY DATE (NEW)
  // ────────────────────────────────────────────────
  // ────────────────────────────────────────────────
  // STEP 1.5: GROUP BY DATE (ROBUST - REPLACE THE OLD BLOCK)
  // ────────────────────────────────────────────────
  const grouped = {};

  cleanedData.forEach((item) => {
    // prefer explicit 'date', then created_at, then createdAt
    const raw = item.date ?? item.created_at ?? item.createdAt;

    let dateKey = "Unknown Date";

    if (raw != null) {
      // 1) string like "2025-11-03T12:30:00Z" or "2025-11-03"
      if (typeof raw === "string") {
        // try ISO-ish split first, else use raw trimmed
        if (raw.includes("T")) {
          dateKey = raw.split("T")[0];
        } else {
          dateKey = raw.trim();
        }
      }
      // 2) Date object
      else if (raw instanceof Date) {
        dateKey = raw.toISOString().split("T")[0];
      }
      // 3) numeric timestamp (ms)
      else if (typeof raw === "number") {
        dateKey = new Date(raw).toISOString().split("T")[0];
      }
      // 4) fallback: try coercing to Date
      else {
        try {
          const d = new Date(raw);
          if (!Number.isNaN(d.getTime())) {
            dateKey = d.toISOString().split("T")[0];
          } else {
            dateKey = String(raw);
          }
        } catch (e) {
          dateKey = String(raw);
        }
      }
    }

    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  // ────────────────────────────────────────────────
  // STEP 2: MEASURE REQUIRED PAGE HEIGHT
  // ────────────────────────────────────────────────
  const temp = new PDFDocument({ margin: 20 });
  let requiredHeight = 120;

  for (const date of Object.keys(grouped)) {
    requiredHeight += 40; // space for date header

    grouped[date].forEach((item) => {
      const combinedField = [
        item.daily_accomplishment,
        item.rca_investigation,
        item.resolution_and_steps,
      ]
        .filter(Boolean)
        .join("\n\n");

      const cells = [item.task_id, item.task_type, combinedField];

      let rowHeight = 0;

      cells.forEach((text, i) => {
        const h = temp.heightOfString(text || "", { width: colWidths[i] - 6 });
        if (h > rowHeight) rowHeight = h;
      });

      requiredHeight += rowHeight + 15;
    });
  }

  temp.end();

  const pageHeight = Math.max(900, requiredHeight);

  // ────────────────────────────────────────────────
  // STEP 3: START REAL PDF
  // ────────────────────────────────────────────────
  const doc = new PDFDocument({
    size: [1800, pageHeight],
    margin: 20,
  });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(18).text("Time Sheet Report", { align: "center" });
    doc.moveDown(1);

    let y = doc.y;
    const xStart = 20;

    const drawCell = (x, y, w, h, text, bold = false, fillColor = null) => {
      if (fillColor) {
        doc.save().rect(x, y, w, h).fill(fillColor).restore();
      }

      doc.rect(x, y, w, h).stroke();

      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .fillColor("#000")
        .text(text, x + 4, y + 4, { width: w - 6 });
    };

    // ────────────────────────────────────────────────
    // HEADER
    // ────────────────────────────────────────────────
    const headers = ["Task ID", "Type", "Details", "Time Spent"];
    const headerHeight = 22;

    // ────────────────────────────────────────────────
    // RENDER BY DATE GROUP
    // ────────────────────────────────────────────────
    for (const date of Object.keys(grouped)) {
      // DATE HEADER (full width)
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#000")
        .text(date, xStart, y);
      y += 30;

      // TABLE COLUMNS
      let x = xStart;
      headers.forEach((h, i) => {
        drawCell(x, y, colWidths[i], headerHeight, h, true);
        x += colWidths[i];
      });

      y += headerHeight;

      // ROWS FOR THIS DATE
      grouped[date].forEach((item) => {
        const combinedField = [
          item.daily_accomplishment,
          item.rca_investigation,
          item.resolution_and_steps,
        ]
          .filter(Boolean)
          .join("\n\n");

        const timeSpent =
          `${item.hour ? item.hour + " hrs" : ""} ` +
          `${item.minute ? item.minute + " mins" : ""}`.trim();

        const cells = [item.task_id, item.task_type, combinedField, timeSpent];
        let rowHeight = 0;

        cells.forEach((text, i) => {
          const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
          if (h > rowHeight) rowHeight = h;
        });

        rowHeight += 12;

        x = xStart;

        const rowColor = item.color_row || null;

        cells.forEach((text, i) => {
          drawCell(x, y, colWidths[i], rowHeight, text, false, rowColor);
          x += colWidths[i];
        });

        y += rowHeight;
      });

      y += 20; // spacing between date sections
    }

    doc.end();
  });
};

exports.generateTaskViewPDFFromReport = async (data) => {
  const PDFDocument = require("pdfkit");

  // ────────────────────────────────────────────────
  // COLUMN WIDTHS
  // ────────────────────────────────────────────────
  const colWidths = [80, 250, 750, 100];
  const headerHeight = 22;

  // ────────────────────────────────────────────────
  // STEP 1: CLEAN DATA
  // ────────────────────────────────────────────────
  const cleanedData = data.map((item) => ({
    ...item,

    module_names: item.module_names
      ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    report_names: item.report_names
      ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    daily_accomplishment: item.daily_accomplishment
      ? (() => {
          const html = item.daily_accomplishment;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter(Boolean);
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  // ────────────────────────────────────────────────
  // STEP 1.6: GROUP BY TASK (YOUR BLOCK)
  // ────────────────────────────────────────────────
  const groupedByTask = {};
  cleanedData.forEach((item) => {
    if (!groupedByTask[item.task_id]) groupedByTask[item.task_id] = [];
    groupedByTask[item.task_id].push(item);
  });

  // ────────────────────────────────────────────────
  // STEP 2: FINAL PDF
  // ────────────────────────────────────────────────
  const doc = new PDFDocument({
    size: [1800, 2000],
    margin: 20,
  });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(18).text("Task Report", { align: "center" });
    doc.moveDown(1);

    let y = doc.y;
    const xStart = 20;

    // ────────────────────────────────────────────────
    // CELL DRAWER
    // ────────────────────────────────────────────────
    const drawCell = (x, y, w, h, text, bold = false, fillColor = null) => {
      if (fillColor) {
        doc.save().rect(x, y, w, h).fill(fillColor).restore();
      }

      doc.rect(x, y, w, h).stroke();
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .fillColor("#000")
        .text(text, x + 4, y + 4, { width: w - 6 });
    };

    const headers = ["Task ID", "Type", "Details", "Time Spent"];

    // ────────────────────────────────────────────────
    // SECTION 2 — GROUPED BY TASK  (YOUR BLOCK INSERTED)
    // ────────────────────────────────────────────────
    // doc.fontSize(16).text("Grouped by Task", xStart, y);
    y += 30;

    for (const taskId of Object.keys(groupedByTask)) {
      const items = groupedByTask[taskId];

      // TASK HEADER
      doc.font("Helvetica-Bold").fontSize(14).text(taskId, xStart, y);
      y += 30;

      // TABLE HEADER
      let x = xStart;
      headers.forEach((h, i) => {
        drawCell(x, y, colWidths[i], headerHeight, h, true);
        x += colWidths[i];
      });

      y += headerHeight;

      // TASK ROWS
      items.forEach((item) => {
        const combinedField = [
          item.daily_accomplishment,
          item.rca_investigation,
          item.resolution_and_steps,
        ]
          .filter(Boolean)
          .join("\n\n");

        const timeSpent =
          `${item.hour ? item.hour + " hrs" : ""} ` +
          `${item.minute ? item.minute + " mins" : ""}`.trim();

        const dateStr = item.created_at
          ? moment(item.created_at).format("YYYY-MM-DD")
          : "";

        console.log(item.created_at);

        const cells = [dateStr, item.task_type, combinedField, timeSpent];

        let rowHeight = 0;
        cells.forEach((text, i) => {
          const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
          if (h > rowHeight) rowHeight = h;
        });
        rowHeight += 12;

        let x = xStart;
        const rowColor = item.color_row || null;

        cells.forEach((text, i) => {
          drawCell(x, y, colWidths[i], rowHeight, text, false, rowColor);
          x += colWidths[i];
        });

        y += rowHeight;
      });

      y += 40;
    }

    doc.end();
  });
};

exports.generateTaskViewExcelFromReport = async (data) => {
  // ────────────────────────────────────────────────
  // STEP 1: CLEAN DATA (same as PDF)
  // ────────────────────────────────────────────────
  const cleanedData = data.map((item) => ({
    ...item,

    module_names: item.module_names
      ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    report_names: item.report_names
      ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
          ", "
        )
      : "",

    daily_accomplishment: item.daily_accomplishment
      ? (() => {
          const html = item.daily_accomplishment;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;");
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter(Boolean);
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  // ────────────────────────────────────────────────
  // STEP 2: GROUP BY TASK
  // ────────────────────────────────────────────────
  const groupedByTask = {};
  cleanedData.forEach((item) => {
    if (!groupedByTask[item.task_id]) groupedByTask[item.task_id] = [];
    groupedByTask[item.task_id].push(item);
  });

  // ────────────────────────────────────────────────
  // STEP 3: INIT EXCEL SHEET
  // ────────────────────────────────────────────────
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Task Report");

  // Set default column widths (similar to PDF)
  sheet.columns = [
    { header: "Task Report", width: 20 },
    { header: "Type", width: 20 },
    { header: "Details", width: 80 },
    { header: "Time Spent", width: 20 },
  ];

  // Title
  // sheet.addRow(["Task Report"]);
  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").font = { size: 18, bold: true };
  sheet.addRow([]);

  // ────────────────────────────────────────────────
  // STEP 4: WRITE DATA GROUPED BY TASK
  // ────────────────────────────────────────────────
  for (const taskId of Object.keys(groupedByTask)) {
    const items = groupedByTask[taskId];

    // Task title row
    const taskRow = sheet.addRow([taskId]);
    taskRow.font = { bold: true, size: 14 };
    sheet.mergeCells(`A${taskRow.number}:D${taskRow.number}`);

    // Header row
    const headerRow = sheet.addRow(["Date", "Type", "Details", "Time Spent"]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "DDDDDD" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ROWS
    items.forEach((item) => {
      const combinedField = [
        item.daily_accomplishment,
        item.rca_investigation,
        item.resolution_and_steps,
      ]
        .filter(Boolean)
        .join("\n\n");

      const timeSpent =
        `${item.hour ? item.hour + " hrs" : ""} ` +
        `${item.minute ? item.minute + " mins" : ""}`.trim();

      const dateStr = item.created_at
        ? moment(item.created_at).format("YYYY-MM-DD")
        : "";

      const row = sheet.addRow([
        dateStr,
        item.task_type,
        combinedField,
        timeSpent,
      ]);

      // Wrap text
      row.height = combinedField.split("\n").length * 15;
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: "top" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Apply row background color (matching PDF)
      if (item.color_row) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: item.color_row.replace("#", "") },
          };
        });
      }
    });

    sheet.addRow([]); // blank space
  }

  // ────────────────────────────────────────────────
  // STEP 5: RETURN EXCEL BUFFER
  // ────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// exports.generateTasksPDFFromReport = async (data) => {
//   const PDFDocument = require("pdfkit");

//   // ────────────────────────────────────────────────
//   // COLUMN WIDTHS (3 columns)
//   // ────────────────────────────────────────────────
//   const colWidths = [
//     80, // Task ID
//     250, // Type / Category
//     750, // Combined field
//     100,
//   ];

//   // ────────────────────────────────────────────────
//   // STEP 1: CLEAN + EXTRACT TEXT
//   // ────────────────────────────────────────────────
//   const cleanedData = data.map((item) => ({
//     ...item,

//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   // ────────────────────────────────────────────────
//   // STEP 2: MEASURE REQUIRED PAGE HEIGHT
//   // ────────────────────────────────────────────────
//   const temp = new PDFDocument({ margin: 20 });
//   let requiredHeight = 120;

//   cleanedData.forEach((item) => {
//     const combinedField = [
//       item.daily_accomplishment,
//       item.rca_investigation,
//       item.resolution_and_steps,
//     ]
//       .filter(Boolean)
//       .join("\n\n");

//     const cells = [item.task_id, item.task_type, combinedField];

//     let rowHeight = 0;

//     cells.forEach((text, i) => {
//       const h = temp.heightOfString(text || "", { width: colWidths[i] - 6 });
//       if (h > rowHeight) rowHeight = h;
//     });

//     requiredHeight += rowHeight + 15;
//   });

//   temp.end();

//   const pageHeight = Math.max(900, requiredHeight);

//   // ────────────────────────────────────────────────
//   // STEP 3: START REAL PDF
//   // ────────────────────────────────────────────────
//   const doc = new PDFDocument({
//     size: [1800, pageHeight],
//     margin: 20,
//   });

//   const buffers = [];
//   doc.on("data", buffers.push.bind(buffers));

//   return new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(buffers)));

//     doc.fontSize(18).text("Task Report", { align: "center" });
//     doc.moveDown(1);

//     let y = doc.y;
//     const xStart = 20;

//     // Draw table cell
//     const drawCell = (x, y, w, h, text, bold = false, fillColor = null) => {
//       if (fillColor) {
//         doc.save().rect(x, y, w, h).fill(fillColor).restore();
//       }

//       doc.rect(x, y, w, h).stroke();

//       doc
//         .font(bold ? "Helvetica-Bold" : "Helvetica")
//         .fontSize(10)
//         .fillColor("#000")
//         .text(text, x + 4, y + 4, { width: w - 6 });
//     };

//     // ────────────────────────────────────────────────
//     // TABLE HEADER
//     // ────────────────────────────────────────────────
//     const headers = ["Task ID", "Type", "Combined Fields", "Time Spent"];

//     let headerHeight = 22;
//     let x = xStart;

//     headers.forEach((h, i) => {
//       drawCell(x, y, colWidths[i], headerHeight, h, true);
//       x += colWidths[i];
//     });

//     y += headerHeight;

//     // ────────────────────────────────────────────────
//     // TABLE ROWS
//     // ────────────────────────────────────────────────
//     cleanedData.forEach((item) => {
//       const combinedField = [
//         item.daily_accomplishment,
//         item.rca_investigation,
//         item.resolution_and_steps,
//       ]
//         .filter(Boolean)
//         .join("\n\n");

//       const timeSpent =
//         `${item.hour ? item.hour + " hrs" : ""} ` +
//         `${item.minute ? item.minute + " mins" : ""}`.trim();

//       const cells = [item.task_id, item.task_type, combinedField, timeSpent];
//       let rowHeight = 0;

//       cells.forEach((text, i) => {
//         const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
//         if (h > rowHeight) rowHeight = h;
//       });

//       rowHeight += 12;

//       x = xStart;

//       const rowColor = item.color_row || null;

//       cells.forEach((text, i) => {
//         drawCell(x, y, colWidths[i], rowHeight, text, false, rowColor);
//         x += colWidths[i];
//       });

//       y += rowHeight;
//     });

//     doc.end();
//   });
// };

// exports.generateTasksPDFFromReport = async (data) => {
//   const PDFDocument = require("pdfkit");

//   // const colWidths = [80, 120, 150, 150, 60, 70, 250, 250, 250];

//   const colWidths = [
//     80, // Task ID
//     // 120, // Application
//     // 150, // Modules
//     // 150, // Reports
//     // 60, // Ticket Id
//     // 70, // Time
//     250, // Type
//     750,
//     // 250, // Daily Accomplishment
//     // 250, // RCA
//     // 250, // Resolution  <-- Add this new one
//   ];

//   // ✅ Step 1: measure required height
//   const temp = new PDFDocument({ margin: 20 });
//   const cleanedData = data.map((item) => ({
//     ...item,
//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   let requiredHeight = 120;

//   cleanedData.forEach((item) => {
//     const cells = [
//       item.task_id,
//       // item.application_name,
//       // item.module_names,
//       // item.report_names,
//       // item.ticket_id,
//       // `${item.hour}h ${item.minute}m`,
//       item.task_type,
//       {
//         ...item.daily_accomplishment,
//         ...item.rca_investigation,
//         ...item.resolution_and_steps,
//       },
//       // item.daily_accomplishment,
//       // item.rca_investigation,
//       // item.resolution_and_steps,
//     ];

//     let rowHeight = 0;

//     cells.forEach((text, i) => {
//       const h = temp.heightOfString(text || "", { width: colWidths[i] - 6 });
//       if (h > rowHeight) rowHeight = h;
//     });

//     requiredHeight += rowHeight + 15;
//   });

//   temp.end();

//   const pageHeight = Math.max(900, requiredHeight);

//   // PDF START
//   const doc = new PDFDocument({
//     size: [1800, pageHeight],
//     margin: 20,
//   });

//   const buffers = [];
//   doc.on("data", buffers.push.bind(buffers));

//   return new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(buffers)));

//     doc.fontSize(18).text("Task Report", { align: "center" });
//     doc.moveDown(1);

//     let y = doc.y;
//     const xStart = 20;

//     // ------------------------------------------------------
//     // 🔥 Updated drawCell with background color support
//     // ------------------------------------------------------
//     const drawCell = (x, y, w, h, text, bold = false, fillColor = null) => {
//       if (fillColor) {
//         doc.save().rect(x, y, w, h).fill(fillColor).restore();
//       }

//       doc.rect(x, y, w, h).stroke();

//       doc
//         .font(bold ? "Helvetica-Bold" : "Helvetica")
//         .fontSize(10)
//         .fillColor("#000")
//         .text(text, x + 4, y + 4, { width: w - 6 });
//     };

//     // HEADER
//     const headers = [
//       "Task ID",
//       // "Application",
//       // "Modules",
//       // "Reports",
//       // "Ticket Id",
//       // "Time",
//       "Type",
//       "All Fields Combined",
//       // "Daily Accomplishment",
//       // "RCA",
//       // "Resolution",
//     ];

//     let headerHeight = 22;
//     let x = xStart;

//     headers.forEach((h, i) => {
//       drawCell(x, y, colWidths[i], headerHeight, h, true);
//       x += colWidths[i];
//     });

//     y += headerHeight;

//     // ------------------------------------------------------
//     // 🔥 Draw rows WITH background color
//     // ------------------------------------------------------
//     cleanedData.forEach((item) => {
//       const cells = [
//         item.task_id,
//         // item.application_name,
//         // item.module_names,
//         // item.report_names,
//         // item.ticket_id,
//         // `${item.hour}h ${item.minute}m`,
//         item.task_type,
//         {
//           ...item.daily_accomplishment,
//           ...item.rca_investigation,
//           ...item.resolution_and_steps,
//         },
//         // item.task_type,
//         // item.daily_accomplishment,
//         // item.rca_investigation,
//         // item.resolution_and_steps,
//       ];

//       let rowHeight = 0;

//       cells.forEach((text, i) => {
//         const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
//         if (h > rowHeight) rowHeight = h;
//       });

//       rowHeight += 12;

//       x = xStart;

//       // 🌈 Apply row color (if exists)
//       const rowColor = item.color_row ? item.color_row : null;

//       cells.forEach((text, i) => {
//         drawCell(x, y, colWidths[i], rowHeight, text, false, rowColor);
//         x += colWidths[i];
//       });

//       y += rowHeight;
//     });

//     doc.end();
//   });
// };

// exports.generateTasksPDFFromReport = async (data) => {
//   // ✅ Step 1 — Clean data like Excel version
//   const cleanedData = data.map((item) => ({
//     ...item,
//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     daily_accomplishment: item.daily_accomplishment
//       ? item.daily_accomplishment.replace(/<[^>]+>/g, "\n").trim()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? item.resolution_and_steps.replace(/<[^>]+>/g, "\n").trim()
//       : "",

//     rca_investigation: item.rca_investigation
//       ? item.rca_investigation.replace(/<[^>]+>/g, "\n").trim()
//       : "",
//   }));

//   // ✅ Step 2 — Create PDF
//   const doc = new PDFDocument({ margin: 30, size: "A4" });
//   let buffers = [];
//   doc.on("data", buffers.push.bind(buffers));
//   doc.on("end", () => {});

//   // ✅ Header
//   doc.fontSize(18).text("Task Report", { align: "center" });
//   doc.moveDown(1);

//   // ✅ Step 3 — Add rows
//   cleanedData.forEach((item, index) => {
//     doc.fontSize(12).text(`Task ID: ${item.task_id}`);
//     doc.text(`Application: ${item.application_name}`);
//     doc.text(`Modules: ${item.module_names}`);
//     doc.text(`Reports: ${item.report_names}`);
//     doc.text(`SR No: ${item.sr_no}`);
//     doc.text(`Time: ${item.hour}h ${item.minute}m`);
//     doc.text(`Task Type: ${item.task_type}`);

//     doc.moveDown(0.5);

//     doc.font("Helvetica-Bold").text("Daily Accomplishment:");
//     doc.font("Helvetica").text(item.daily_accomplishment || "", { indent: 10 });

//     doc.moveDown(0.5);

//     doc.font("Helvetica-Bold").text("RCA Investigation:");
//     doc.font("Helvetica").text(item.rca_investigation || "", { indent: 10 });

//     doc.moveDown(0.5);

//     doc.font("Helvetica-Bold").text("Resolution & Steps:");
//     doc.font("Helvetica").text(item.resolution_and_steps || "", { indent: 10 });

//     doc.moveDown(1);

//     // ✅ Page break if needed
//     if (doc.y > 700) doc.addPage();
//   });

//   // ✅ Finish PDF
//   doc.end();

//   return new Promise((resolve) => {
//     doc.on("end", () => {
//       resolve(Buffer.concat(buffers));
//     });
//   });
// };
// exports.generateTasksPDFFromReport = async (data) => {
//   const PDFDocument = require("pdfkit");

//   const colWidths = [80, 120, 150, 150, 60, 70, 250, 250, 250];

//   // ✅ Step 1: measure required height
//   const temp = new PDFDocument({ margin: 20 });
//   const cleanedData = data.map((item) => ({
//     ...item,
//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",
//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           console.log("let it burn__", item.rca_investigation);
//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           // .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   let requiredHeight = 120; // header + spacing

//   cleanedData.forEach((item) => {
//     const cells = [
//       item.task_id,
//       item.application_name,
//       item.module_names,
//       item.report_names,
//       `${item.hour}h ${item.minute}m`,
//       item.task_type,
//       (item.daily_accomplishment || "").replace(/<[^>]+>/g, ""),
//       (item.rca_investigation || "").replace(/<[^>]+>/g, ""),
//       (item.resolution_and_steps || "").replace(/<[^>]+>/g, ""),
//     ];

//     let rowHeight = 0;
//     cells.forEach((text, i) => {
//       const h = temp.heightOfString(text || "", { width: colWidths[i] - 6 });
//       if (h > rowHeight) rowHeight = h;
//     });

//     requiredHeight += rowHeight + 15;
//   });

//   temp.end();

//   const pageHeight = Math.max(900, requiredHeight);

//   // ✅ Step 2: create final PDF with dynamic height
//   const doc = new PDFDocument({
//     size: [1800, pageHeight],
//     margin: 20,
//   });

//   const buffers = [];
//   doc.on("data", buffers.push.bind(buffers));

//   return new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(buffers)));

//     doc.fontSize(18).text("Task Report", { align: "center" });
//     doc.moveDown(1);

//     let y = doc.y;
//     const xStart = 20;

//     const drawCell = (x, y, w, h, text, bold = false) => {
//       doc.rect(x, y, w, h).stroke();
//       doc
//         .font(bold ? "Helvetica-Bold" : "Helvetica")
//         .fontSize(10)
//         .text(text, x + 4, y + 4, { width: w - 6 });
//     };

//     // ✅ Draw header
//     const headers = [
//       "Task ID",
//       "Application",
//       "Modules",
//       "Reports",
//       "Time",
//       "Type",
//       "Daily Accomplishment",
//       "RCA",
//       "Resolution",
//     ];

//     let headerHeight = 22;
//     let x = xStart;

//     headers.forEach((h, i) => {
//       drawCell(x, y, colWidths[i], headerHeight, h, true);
//       x += colWidths[i];
//     });

//     y += headerHeight;

//     // ✅ Draw rows
//     cleanedData.forEach((item) => {
//       const cells = [
//         item.task_id,
//         item.application_name,
//         item.module_names,
//         item.report_names,
//         `${item.hour}h ${item.minute}m`,
//         item.task_type,
//         (item.daily_accomplishment || "").replace(/<[^>]+>/g, ""),
//         (item.rca_investigation || "").replace(/<[^>]+>/g, ""),
//         (item.resolution_and_steps || "").replace(/<[^>]+>/g, ""),
//       ];

//       let rowHeight = 0;

//       // measure tallest cell
//       cells.forEach((text, i) => {
//         const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
//         if (h > rowHeight) rowHeight = h;
//       });

//       rowHeight += 12;

//       x = xStart;

//       cells.forEach((text, i) => {
//         drawCell(x, y, colWidths[i], rowHeight, text);
//         x += colWidths[i];
//       });

//       y += rowHeight;
//     });

//     doc.end();
//   });
// };

// Current
// exports.generateTasksPDFFromReport = async (data) => {
//   const doc = new PDFDocument({ margin: 20, size: "A4", layout: "landscape" });
//   const buffers = [];
//   doc.on("data", buffers.push.bind(buffers));

//   const cleanedData = data.map((item) => ({
//     ...item,
//     module_names: item.module_names
//       ? [...new Set(item.module_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",

//     report_names: item.report_names
//       ? [...new Set(item.report_names.split(",").map((s) => s.trim()))].join(
//           ", "
//         )
//       : "",
//     daily_accomplishment: item.daily_accomplishment
//       ? (() => {
//           const html = item.daily_accomplishment;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",

//     resolution_and_steps: item.resolution_and_steps
//       ? (() => {
//           const html = item.resolution_and_steps;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
//             .map((m) => m[1].trim())
//             .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           console.log("let it burn__", item.rca_investigation);
//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//     rca_investigation: item.rca_investigation
//       ? (() => {
//           const html = item.rca_investigation;

//           // 1️⃣ Extract plain text inside <p> tags
//           const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
//             m[1].trim()
//           );
//           // .filter((t) => t && t !== "&nbsp;" && t !== "");
//           // 2️⃣ Extract queries using your existing function
//           const queries =
//             this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

//           // 3️⃣ Merge both results
//           return [...pTags, ...queries].join("\n");
//         })()
//       : "",
//   }));

//   return new Promise((resolve) => {
//     doc.on("end", () => resolve(Buffer.concat(buffers)));

//     // ✅ Title
//     doc.fontSize(18).text("Task Report", { align: "center" });
//     doc.moveDown(1);

//     // ✅ Table column widths
//     const tableX = 20;
//     // ✅ Table column widths (9 columns)
//     const colWidths = [60, 80, 90, 90, 40, 50, 130, 130, 130];

//     // ✅ Draw header row
//     drawRow(
//       doc,
//       tableX,
//       doc.y,
//       colWidths,
//       [
//         "Task ID",
//         "Application",
//         "Modules",
//         "Reports",
//         "Time",
//         "Type",
//         "Daily Accomplishment",
//         "RCA Investigation",
//         "Resolution & Steps",
//       ],
//       true
//     );

//     // ✅ Rows
//     cleanedData.forEach((item) => {
//       const rowData = [
//         item.task_id || "",
//         item.application_name || "",
//         item.module_names || "",
//         item.report_names || "",
//         `${item.hour}h ${item.minute}m`,
//         item.task_type || "",
//         (item.daily_accomplishment || "").replace(/<[^>]+>/g, ""),
//         (item.rca_investigation || "").replace(/<[^>]+>/g, ""),
//         (item.resolution_and_steps || "").replace(/<[^>]+>/g, ""),
//       ];

//       drawRow(doc, tableX, doc.y, colWidths, rowData);

//       // ✅ Page break
//       if (doc.y > 750) {
//         doc.addPage();
//         drawRow(
//           doc,
//           tableX,
//           doc.y,
//           colWidths,
//           [
//             "Task ID",
//             "Application",
//             "Modules",
//             "Reports",
//             "Time",
//             "Type",
//             "Daily Accomplishment",
//             "RCA Investigation",
//             "Resolution & Steps",
//           ],
//           true
//         );
//       }
//     });

//     doc.end();
//   });
// };

// ✅ Helper: draw table row
function drawRow(doc, x, y, widths, textArray, header = false) {
  let rowHeight = 0;

  // Calculate row height based on text wrapping
  textArray.forEach((text, i) => {
    const h = doc.heightOfString(text, { width: widths[i] - 4 });
    if (h > rowHeight) rowHeight = h;
  });

  rowHeight += 8;

  // ✅ Background for header
  if (header) {
    doc
      .rect(
        x,
        y,
        widths.reduce((a, b) => a + b),
        rowHeight
      )
      .fill("#eeeeee");
    doc.fillColor("black");
  }

  // ✅ Draw text
  let xPos = x;
  textArray.forEach((text, i) => {
    doc.text(text, xPos + 2, y + 4, { width: widths[i] - 4 });
    xPos += widths[i];
  });

  // ✅ Draw borders
  doc.strokeColor("black");
  doc
    .rect(
      x,
      y,
      widths.reduce((a, b) => a + b),
      rowHeight
    )
    .stroke();
  doc.moveDown();

  doc.y = y + rowHeight;
}
