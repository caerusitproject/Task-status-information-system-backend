// const ExcelJS = require('exceljs');
const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../models");
const PDFDocument = require("pdfkit");
const { Report, TaskDetail, Application, Module } = require("../models");
const streamBuffers = require("stream-buffers");
const logger = require("../logger");
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

  static async getTimeSheetDetails(startDate, endDate) {
    const query = `
SELECT
    td.tstatus_id,
    -- td.app_id,
    -- app.name AS application_name,

    -- td.module_id,
    -- STRING_AGG(m.name, ', ') AS module_names,
    td.sr_no,
    td.task_id,
    -- td.report_id,
    -- STRING_AGG(r.name, ', ') AS report_names,

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
    td.created_at BETWEEN :startDate AND :endDate

GROUP BY
    td.id, td.tstatus_id, 
    -- td.app_id, 
    -- app.name,
    -- td.module_id,
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

      logger.info("Time sheet details fetched successfully");
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
}

module.exports = ReportInfoService;
