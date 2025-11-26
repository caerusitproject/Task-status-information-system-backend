const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
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
exports.generateTasksExcelFromReport = async (data) => {
  // Step 1 — Deduplicate CSV strings
  {
  }
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

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          console.log("let it burn__", item.rca_investigation);
          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",
    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          // .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  // Step 2 — Create Excel
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Task Report");

  ws.columns = [
    // { header: "TStatus ID", key: "tstatus_id", width: 12 },
    { header: "Task ID", key: "task_id", width: 20 },
    { header: "Application ID", key: "app_id", width: 15 },
    { header: "Application Name", key: "application_name", width: 20 },

    // { header: "Module IDs", key: "module_id", width: 20 },
    { header: "Module Names", key: "module_names", width: 35 },

    { header: "SR No", key: "sr_no", width: 15 },

    // { header: "Report IDs", key: "report_id", width: 20 },
    { header: "Report Names", key: "report_names", width: 35 },

    { header: "Hour", key: "hour", width: 10 },
    { header: "Minute", key: "minute", width: 10 },

    { header: "Task Type", key: "task_type", width: 18 },

    { header: "Daily Accomplishment", key: "daily_accomplishment", width: 40 },
    { header: "RCA Investigation", key: "rca_investigation", width: 40 },
    { header: "Resolution and Steps", key: "resolution_and_steps", width: 40 },

    { header: "Created At", key: "created_at", width: 25 },
    { header: "Updated At", key: "updated_at", width: 25 },
  ];
  ws.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  // Step 3 — Add rows
  cleanedData.forEach((item) => {
    ws.addRow({
      tstatus_id: item.tstatus_id,
      app_id: item.app_id,
      application_name: item.application_name,

      module_id: item.module_id,
      module_names: item.module_names,

      sr_no: item.sr_no,
      task_id: item.task_id,

      report_id: item.report_id,
      report_names: item.report_names,

      hour: item.hour,
      minute: item.minute,
      task_type: item.task_type,

      daily_accomplishment: item.daily_accomplishment || "",
      resolution_and_steps: item.resolution_and_steps || "",
      rca_investigation: item.rca_investigation || "",

      created_at: item.created_at
        ? new Date(item.created_at).toLocaleString()
        : "",
      updated_at: item.updated_at
        ? new Date(item.updated_at).toLocaleString()
        : "",
    });
  });

  // Step 4 — Return Excel buffer
  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

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
exports.generateTasksPDFFromReport = async (data) => {
  const PDFDocument = require("pdfkit");

  const colWidths = [80, 120, 150, 150, 60, 70, 250, 250, 250];

  // ✅ Step 1: measure required height
  const temp = new PDFDocument({ margin: 20 });
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

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",

    resolution_and_steps: item.resolution_and_steps
      ? (() => {
          const html = item.resolution_and_steps;

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
            .map((m) => m[1].trim())
            .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          console.log("let it burn__", item.rca_investigation);
          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",
    rca_investigation: item.rca_investigation
      ? (() => {
          const html = item.rca_investigation;

          // 1️⃣ Extract plain text inside <p> tags
          const pTags = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)].map((m) =>
            m[1].trim()
          );
          // .filter((t) => t && t !== "&nbsp;" && t !== "");
          // 2️⃣ Extract queries using your existing function
          const queries =
            this.extractQueries(html)?.map((q) => q.replace(/"/g, "'")) || [];

          // 3️⃣ Merge both results
          return [...pTags, ...queries].join("\n");
        })()
      : "",
  }));

  let requiredHeight = 120; // header + spacing

  cleanedData.forEach((item) => {
    const cells = [
      item.task_id,
      item.application_name,
      item.module_names,
      item.report_names,
      `${item.hour}h ${item.minute}m`,
      item.task_type,
      (item.daily_accomplishment || "").replace(/<[^>]+>/g, ""),
      (item.rca_investigation || "").replace(/<[^>]+>/g, ""),
      (item.resolution_and_steps || "").replace(/<[^>]+>/g, ""),
    ];

    let rowHeight = 0;
    cells.forEach((text, i) => {
      const h = temp.heightOfString(text || "", { width: colWidths[i] - 6 });
      if (h > rowHeight) rowHeight = h;
    });

    requiredHeight += rowHeight + 15;
  });

  temp.end();

  const pageHeight = Math.max(900, requiredHeight);

  // ✅ Step 2: create final PDF with dynamic height
  const doc = new PDFDocument({
    size: [1800, pageHeight],
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

    const drawCell = (x, y, w, h, text, bold = false) => {
      doc.rect(x, y, w, h).stroke();
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(10)
        .text(text, x + 4, y + 4, { width: w - 6 });
    };

    // ✅ Draw header
    const headers = [
      "Task ID",
      "Application",
      "Modules",
      "Reports",
      "Time",
      "Type",
      "Daily Accomplishment",
      "RCA",
      "Resolution",
    ];

    let headerHeight = 22;
    let x = xStart;

    headers.forEach((h, i) => {
      drawCell(x, y, colWidths[i], headerHeight, h, true);
      x += colWidths[i];
    });

    y += headerHeight;

    // ✅ Draw rows
    cleanedData.forEach((item) => {
      const cells = [
        item.task_id,
        item.application_name,
        item.module_names,
        item.report_names,
        `${item.hour}h ${item.minute}m`,
        item.task_type,
        (item.daily_accomplishment || "").replace(/<[^>]+>/g, ""),
        (item.rca_investigation || "").replace(/<[^>]+>/g, ""),
        (item.resolution_and_steps || "").replace(/<[^>]+>/g, ""),
      ];

      let rowHeight = 0;

      // measure tallest cell
      cells.forEach((text, i) => {
        const h = doc.heightOfString(text || "", { width: colWidths[i] - 6 });
        if (h > rowHeight) rowHeight = h;
      });

      rowHeight += 12;

      x = xStart;

      cells.forEach((text, i) => {
        drawCell(x, y, colWidths[i], rowHeight, text);
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
  });
};

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
