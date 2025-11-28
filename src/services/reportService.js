// const ExcelJS = require('exceljs');
const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../models");
const PDFDocument = require("pdfkit");
const { Report, TaskDetail, Application, Module } = require("../models");
const streamBuffers = require("stream-buffers");

class ReportInfoService {
  // 🔹 Create Application Status Info
  static async createReportInfo(data) {
    const { reportName } = data;

    // Validate required fields
    if (!reportName) {
      return { message: "Invalid data provided", status: 400 };
    }

    try {
      // 1️⃣ Create the Application
      const reportInfo = await Report.create({
        name: reportName,
        description: "",
      });

      return {
        message: "Report Name created successfully",
        status: 200,
      };
    } catch (err) {
      console.error("Error creating Report Name info:", err);
      return { message: "Internal server error", status: 500 };
    }
  }

  static async getReportInfo(data = {}) {
    try {
      const page = data.page ? parseInt(data.page, 10) : null;
      const pageSize = data.pagesize ? parseInt(data.pagesize, 10) : null;

      const options = {
        order: [["id", "ASC"]],
        // include: [
        //   {
        //     model: Module,
        //     as: "module", // alias from your association
        //     attributes: ["id", "name"],
        //   },
        // ],
      };

      // Apply pagination only if both are provided
      if (page && pageSize) {
        options.limit = pageSize;
        options.offset = (page - 1) * pageSize;
      }

      const result = await Report.findAndCountAll(options);

      // if (!result.rows || result.rows.length === 0) {
      //   return { message: "No applications found", status: 403 };
      // }

      // If no pagination requested → return all data
      if (!page || !pageSize) {
        return {
          status: 200,
          totalRecords: result.count,
          rows: result.rows,
          pagination: null,
        };
      }

      // Pagination calculations
      const totalRecords = result.count;
      const totalPages = Math.ceil(totalRecords / pageSize);

      return {
        status: 200,
        totalRecords,
        totalPages,
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        rows: result.rows,
      };
    } catch (error) {
      console.error("Error fetching Application Info:", error);
      return { message: "Internal Server Error", status: 500 };
    }
  }
  // static async generateTasksExcel() {
  //   const tasks = await Task.findAll({ order: [["createdAt", "DESC"]] });
  //   const wb = new ExcelJS.Workbook();
  //   const ws = wb.addWorksheet("Tasks");

  //   ws.columns = [
  //     { header: "Task ID", key: "id", width: 36 },
  //     { header: "Title", key: "taskTitle", width: 30 },
  //     { header: "Type", key: "taskType", width: 15 },
  //     { header: "Application", key: "applicationName", width: 20 },
  //     { header: "Module", key: "module", width: 20 },
  //     { header: "Status", key: "status", width: 15 },
  //     { header: "% Complete", key: "percentageComplete", width: 12 },
  //     { header: "Created By", key: "createdBy", width: 20 },
  //     { header: "Created At", key: "createdAt", width: 22 },
  //   ];

  //   tasks.forEach((t) => {
  //     ws.addRow({
  //       id: t.id,
  //       taskTitle: t.taskTitle,
  //       taskType: t.taskType,
  //       applicationName: t.applicationName,
  //       module: t.module,
  //       status: t.status,
  //       percentageComplete: t.percentageComplete,
  //       createdBy: t.createdBy,
  //       createdAt: t.createdAt,
  //     });
  //   });

  //   const buf = await wb.xlsx.writeBuffer();
  //   return buf;
  // }

  static async getTimeSheetDetails(startDate, endDate) {
    const query = `
SELECT
    td.tstatus_id,
    td.app_id,
    app.name AS application_name,

    td.module_id,
    STRING_AGG(m.name, ', ') AS module_names,

    td.sr_no,
    td.task_id,
    td.report_id,
    STRING_AGG(r.name, ', ') AS report_names,

    td.hour,
    td.minute,
    tsi.color_row,
    tsi.ticket_id,
    td.task_type,
    td.daily_accomplishment,
    td.rca_investigation,
    td.resolution_and_steps,
    td.created_at,
    td.updated_at
FROM "taskDetail" td

LEFT JOIN application_info app
    ON app.id = td.app_id::int

LEFT JOIN module_info m
    ON m.id = ANY ( string_to_array(td.module_id, ',')::int[] )

LEFT JOIN report_info r
    ON r.id = ANY ( string_to_array(td.report_id, ',')::int[] )

LEFT JOIN "taskStatusInfo" tsi
    ON tsi.id = td.tstatus_id::int

WHERE 
    td.created_at BETWEEN '2025-11-20' AND '2025-11-29'

GROUP BY
    td.id, td.tstatus_id, td.app_id, app.name,
    td.module_id,
    td.sr_no, td.task_id, td.report_id,
    td.hour, td.minute, td.task_type,
    td.daily_accomplishment, td.rca_investigation,
    td.resolution_and_steps,
    td.created_at, td.updated_at, tsi.color_row, tsi.ticket_id

ORDER BY td.created_at DESC;
  `;

    const data = await sequelize.query(query, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT,
    });

    if (data && data.length > 0) {
      const revisedData = data.map((item) => ({
        ...item,

        module_names: item.module_names
          ? [
              ...new Set(item.module_names.split(",").map((s) => s.trim())),
            ].join(", ")
          : null,

        report_names: item.report_names
          ? [
              ...new Set(item.report_names.split(",").map((s) => s.trim())),
            ].join(", ")
          : null,
      }));
      return revisedData;
      // return {
      //   count: revisedData,
      //   status: 201,
      //   message: "Excel Generated Successfully",
      // };
    } else {
      return [];
    }
  }

  // exports.generateTasksPdf = async ({employeeName,startDate,endDate}) => {
  //   // const tasks = await TaskStatusInfo.findAll({ order: [['created_at','DESC']] });
  //   console.log('datesss',new Date(startDate), new Date(endDate))
  //   const tasks = await TaskStatusInfo.findAll({
  //   where: {
  //     created_at: { [Op.between]: [new Date(startDate), new Date(endDate)] },
  //   },
  //   attributes: [
  //     "status",
  //     [fn("DATE_PART", "week", col("created_at")), "weekNumber"], // ✅ PostgreSQL syntax
  //   ],
  //   raw: true,
  // });
  //   const doc = new PDFDocument({ margin: 30, size: 'A4' });
  //   const writable = new streamBuffers.WritableStreamBuffer();

  //   doc.fontSize(16).text('Tasks Report', { align: 'center' }).moveDown();

  //   // tasks.forEach((t, idx) => {
  //   //   doc.fontSize(12).text(`${idx+1}. ${t.taskTitle} [${t.status}]`);
  //   //   doc.fontSize(10).text(`Type: ${t.taskType} | App: ${t.applicationName} | Module: ${t.module}`);
  //   //   doc.fontSize(10).text(`Created At: ${t.createdAt}`);
  //   //   doc.moveDown(0.5);
  //   // });

  //     const summary = Array.from({ length: 4 }, () => ({
  //     totalTasks: 0,
  //     completed: 0,
  //     inProgress: 0,
  //     blocked: 0,
  //     totalHours: 0,
  //   }));

  //   // Process each record
  //   for (const task of tasks) {
  //     // Calculate which week of the month it belongs to
  //     const date = new Date(task.date);
  //     const weekOfMonth = Math.ceil(date.getDate() / 7) - 1; // 0-based index
  //     const current = summary[weekOfMonth] || summary[3]; // if out of range, last week

  //     current.totalTasks += 1;
  //     current.totalHours += task.timeSpent || 0;

  //     if (task.status === "Completed") current.completed += 1;
  //     else if (task.status === "In Progress") current.inProgress += 1;
  //     else if (task.status === "Blocked") current.blocked += 1;
  //   }

  //   // return summary;

  //   doc.end();

  //   return new Promise((resolve, reject) => {
  //     doc.pipe(writable);
  //     writable.on('finish', () => {
  //       const buffer = writable.getContents();
  //       resolve(buffer);
  //     });
  //     writable.on('error', reject);
  //   });
  // };

  // exports.getWeeklyStatusSummary= async( startDate, endDate )=> {
  //   const query = `
  //     SELECT
  //       TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week_start_date,

  //       -- Counts per status
  //       COUNT(*) FILTER (WHERE status ILIKE 'Completed') AS completed_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'in progress') AS in_progress_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'blocked') AS blocked_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'assigned') AS assigned_count,

  //       -- Week-level totals
  //       COUNT(*) AS total_records_in_week,

  //       -- Total working hours = sum of (updated_at - created_at)
  //       ROUND(SUM(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 2) AS total_work_hours,

  //       -- Optional: activity this week
  //       COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW())) AS created_this_week,
  //       COUNT(*) FILTER (WHERE DATE_TRUNC('week', updated_at) = DATE_TRUNC('week', NOW())) AS updated_this_week

  //     FROM public."taskStatusInfo"
  //     WHERE created_at >= :startDate
  //       AND created_at < :endDate

  //     GROUP BY DATE_TRUNC('week', created_at)
  //     ORDER BY week_start_date;
  //   `;

  //   const results = await sequelize.query(query, {
  //     replacements: { startDate, endDate },
  //     type: sequelize.QueryTypes.SELECT,
  //   });

  //   console.log('pdf____',results)

  //   if(results && results.length == 0){
  //     return []
  //   }

  //   const formatted =results && results.length > 0 && results.map((row,ind) => ({
  //     week_start_date: `Week ${ind + 1}`,
  //     completed_count: Number(row.completed_count) || 0,
  //     in_progress_count: Number(row.in_progress_count) || 0,
  //     blocked_count: Number(row.blocked_count) || 0,
  //     assigned_count: Number(row.assigned_count) || 0,
  //     total_records_in_week: Number(row.total_records_in_week) || 0,
  //     total_work_hours: Number(row.total_work_hours) || 0,
  //     created_this_week: Number(row.created_this_week) || 0,
  //     updated_this_week: Number(row.updated_this_week) || 0,
  //   }));

  //   return formatted;

  //   // return results;
  // }

  // exports.viewReportStatus = async (startDate, endDate)=>{
  //     const query = `
  //     SELECT
  //       TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week_start_date,

  //       -- Counts per status
  //       COUNT(*) FILTER (WHERE status ILIKE 'Completed') AS completed_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'in progress') AS in_progress_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'blocked') AS blocked_count,
  //       COUNT(*) FILTER (WHERE status ILIKE 'assigned') AS assigned_count,

  //       -- Week-level totals
  //       COUNT(*) AS total_records_in_week,

  //       -- Total working hours = sum of (updated_at - created_at)
  //       ROUND(SUM(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 2) AS total_work_hours,

  //       -- Optional: activity this week
  //       COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW())) AS created_this_week,
  //       COUNT(*) FILTER (WHERE DATE_TRUNC('week', updated_at) = DATE_TRUNC('week', NOW())) AS updated_this_week

  //     FROM public."taskStatusInfo"
  //     WHERE created_at >= :startDate
  //       AND created_at < :endDate

  //     GROUP BY DATE_TRUNC('week', created_at)
  //     ORDER BY week_start_date;
  //   `;

  //   const results = await sequelize.query(query, {
  //     replacements: { startDate, endDate },
  //     type: sequelize.QueryTypes.SELECT,
  //   });

  //   console.log('pdf____',results)

  //   if(results && results.length == 0){
  //     return {message:"No Data to view",status:403};
  //   }

  //   const formatted =results && results.length > 0 && results.map((row,ind) => ({
  //     week_start_date: `Week ${ind + 1}`,
  //     completed_count: Number(row.completed_count) || 0,
  //     in_progress_count: Number(row.in_progress_count) || 0,
  //     blocked_count: Number(row.blocked_count) || 0,
  //     assigned_count: Number(row.assigned_count) || 0,
  //     total_records_in_week: Number(row.total_records_in_week) || 0,
  //     total_work_hours: Number(row.total_work_hours) || 0,
  //     created_this_week: Number(row.created_this_week) || 0,
  //     updated_this_week: Number(row.updated_this_week) || 0,
  //   }));

  //   return {message:"Report Generated Successfully", content:formatted ,status:200};
  // }

  // exports.getWeeklyStatusSummary = async ({ startDate, endDate }) => {
  //   const result = await TaskStatusInfo.findAll({
  //     attributes: [
  //       // Week start date
  //       [
  //         fn('TO_CHAR', fn('DATE_TRUNC', 'week', col('created_at')), 'YYYY-MM-DD'),
  //         'week_start_date',
  //       ],

  //       // Counts per status
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'Completed')`),
  //         'completed_count',
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'in progress')`),
  //         'in_progress_count',
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'blocked')`),
  //         'blocked_count',
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'ASSIGNED')`),
  //         'assigned_count',
  //       ],

  //       // Total records in week
  //       [fn('COUNT', literal('*')), 'total_records_in_week'],

  //       // Total working hours
  //       [
  //         literal(`ROUND(SUM(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 2)`),
  //         'total_work_hours',
  //       ],

  //       // Created/updated this week
  //       [
  //         literal(`COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW()))`),
  //         'created_this_week',
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE DATE_TRUNC('week', updated_at) = DATE_TRUNC('week', NOW()))`),
  //         'updated_this_week',
  //       ],
  //     ],

  //     where: {
  //       [Op.or]: [
  //         literal(`created_at >= DATE_TRUNC('week', NOW() - INTERVAL '4 weeks')`),
  //         literal(`updated_at >= DATE_TRUNC('week', NOW() - INTERVAL '4 weeks')`),
  //       ],
  //     },

  //     group: [literal(`DATE_TRUNC('week', created_at)`)],
  //     order: [literal(`DATE_TRUNC('week', created_at) ASC`)],
  //     raw: true,
  //   });

  //   // 🔹 Format and clean up the results
  //   const formatted = result.map((row) => ({
  //     week_start_date: row.week_start_date,
  //     completed_count: Number(row.completed_count) || 0,
  //     in_progress_count: Number(row.in_progress_count) || 0,
  //     blocked_count: Number(row.blocked_count) || 0,
  //     assigned_count: Number(row.assigned_count) || 0,
  //     total_records_in_week: Number(row.total_records_in_week) || 0,
  //     total_work_hours: Number(row.total_work_hours) || 0,
  //     created_this_week: Number(row.created_this_week) || 0,
  //     updated_this_week: Number(row.updated_this_week) || 0,
  //   }));

  //   return formatted;
  // };

  // static getWeeklyStatusSummary = async ({startDate, endDate})=> {

  //    const result = await TaskStatusInfo.findAll({
  //     attributes: [
  //       // Week start date
  //       [
  //         fn('TO_CHAR', fn('DATE_TRUNC', 'week', col('created_at')), 'YYYY-MM-DD'),
  //         'week_start_date'
  //       ],

  //       // Counts per status
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'Completed')`),
  //         'completed_count'
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'in progress')`),
  //         'in_progress_count'
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'blocked')`),
  //         'blocked_count'
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE status ILIKE 'ASSIGNED')`),
  //         'assigned_count'
  //       ],

  //       // Total records in week
  //       [fn('COUNT', literal('*')), 'total_records_in_week'],

  //       // Total working hours (difference between updated_at and created_at)
  //       [
  //         literal(`ROUND(SUM(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 2)`),
  //         'total_work_hours'
  //       ],

  //       // Activity this week
  //       [
  //         literal(`COUNT(*) FILTER (WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', NOW()))`),
  //         'created_this_week'
  //       ],
  //       [
  //         literal(`COUNT(*) FILTER (WHERE DATE_TRUNC('week', updated_at) = DATE_TRUNC('week', NOW()))`),
  //         'updated_this_week'
  //       ],
  //     ],

  //     // WHERE clause: only last 4 weeks
  //     where: {
  //       [Op.or]: [
  //         literal(`created_at >= DATE_TRUNC('week', NOW() - INTERVAL '4 weeks')`),
  //         literal(`updated_at >= DATE_TRUNC('week', NOW() - INTERVAL '4 weeks')`)
  //       ]
  //     },

  //     // GROUP BY week
  //     group: [literal(`DATE_TRUNC('week', created_at)`)],

  //     // ORDER BY week_start_date
  //     order: [literal(`week_start_date ASC`)],

  //     raw: true, // ensures plain JSON output
  //   });

  // console.log('query o/p___',result)
  //   // Combine data by week
  //   const weeks = {};
  //   result.forEach((row) => {
  //     const week = Math.floor(row.weekNumber);
  //     if (!weeks[week]) {
  //       weeks[week] = {
  //         totalTasks: 0,
  //         completed: 0,
  //         inProgress: 0,
  //         blocked: 0,
  //         totalHours: 0,
  //       };
  //     }

  //     weeks[week].totalTasks += parseInt(row.taskCount);
  //     weeks[week].totalHours += parseFloat(row.totalHours || 0);

  //     // if (row.status.toLowerCase() === "completed") weeks[week].completed += parseInt(row.taskCount);
  //     // if (row.status.toLowerCase() === "in progress") weeks[week].inProgress += parseInt(row.taskCount);
  //     // if (row.status.toLowerCase() === "blocked") weeks[week].blocked += parseInt(row.taskCount);
  //   });

  //   // Convert object to array sorted by week
  //   console.log('keys ____',weeks)
  //   return Object.keys(weeks)
  //     .sort((a, b) => a - b)
  //     .map((w, i) => ({
  //       week: `Week ${i + 1}`,
  //       totalTasks: weeks[w].total_records_in_week,
  //       completed: weeks[w].completed_count,
  //       inProgress: weeks[w].in_progress_count,
  //       blocked: weeks[w].blocked_count,
  //       totalHours: weeks[w].total_work_hours,
  //     }));
  // }
}

module.exports = ReportInfoService;
