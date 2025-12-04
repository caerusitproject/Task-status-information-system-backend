const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Application, ApplicationModule, Module } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
const logger = require("../logger");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class ApplicationInfoService {
  // 🔹 Create Application Status Info
  static async createApplicationInfo(data) {
    const { applicationName, applicationDescription, modules } = data;

    // Validate required fields
    if (!applicationName) {
      return { message: "Invalid data provided", status: 400 };
    }

    try {
      // 1️⃣ Create the Application
      const applicationInfo = await Application.create({
        name: applicationName,
        description: applicationDescription,
      });
      logger.info(`Application created with ID: ${applicationInfo.id}`);
      // 2️⃣ If module IDs exist, create mapping
      // if (Array.isArray(modules) && modules.length > 0) {
      //   const moduleData = modules.map((moduleId) => ({
      //     app_id: applicationInfo.id,
      //     module_id: moduleId,
      //   }));

      //   await ApplicationModule.bulkCreate(moduleData);
      // }

      return {
        message: "Application created successfully",
        status: 200,
        applicationId: applicationInfo.id,
      };
    } catch (err) {
      console.error("Error creating application info:", err);
      logger.error(`Error creating application: ${err.message}`);
      return { message: "Internal server error", status: 500 };
    }
  }

  //     return { accessToken, refreshToken };
  //   }

  // 🔹 Get Application Status Info

  static async getApplicationInfo(data = {}) {
    try {
      const page = data.page ? parseInt(data.page, 10) : null;
      const pageSize = data.pagesize ? parseInt(data.pagesize, 10) : null;

      const options = {
        order: [["id", "ASC"]],
        include: [
          {
            model: Module,
            as: "module", // alias from your association
            attributes: ["id", "name"],
          },
        ],
      };

      // Apply pagination only if both are provided
      if (page && pageSize) {
        options.limit = pageSize;
        options.offset = (page - 1) * pageSize;
      }

      const result = await Application.findAndCountAll(options);

      // if (!result.rows || result.rows.length === 0) {
      //   return { message: "No applications found", status: 403 };
      // }
      logger.info(`Fetched ${result.rows.length} applications from database`);

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
      logger.error(`Error fetching applications: ${error.message}`);
      return { message: "Internal Server Error", status: 500 };
    }
  }
  static async editApplicationInfo(data, body) {
    try {
      const { appId } = data;

      if (!appId) {
        return { message: "Application ID not found", status: 403 };
      }

      const application = await Application.findByPk(appId);

      if (!application) {
        return { message: "Application not found!", status: 404 };
      }

      // Validate body
      const { applicationName, applicationDescription, modules } = body;

      if (!applicationName) {
        return { message: "Invalid data provided", status: 400 };
      }

      // ---------- UPDATE ONLY BASIC DETAILS ----------
      await Application.update(
        {
          name: applicationName || "",
          description: applicationDescription || "",
        },
        { where: { id: appId } }
      );

      // ---------- UPDATE MODULE MAPPINGS ----------
      if (Array.isArray(modules)) {
        // fetch module rows
        const moduleRows = await Module.findAll({
          where: { id: modules },
        });

        await application.setModule(moduleRows);
        // (because alias is `module`)
      }

      return { message: "Application updated successfully", status: 200 };
    } catch (error) {
      console.error("Error updating Application:", error);
      return { message: "Internal Server Error", status: 500 };
    }
  }

  // static async editApplicationInfo(data, body) {
  //   try {
  //     if (data.appId) {
  //       const applicationEdit = await Application.findOne({
  //         where: { id: data.appId },
  //         raw: true,
  //       });
  //       if (applicationEdit === null) {
  //         return { message: "Application cannot be Updated!", status: 403 };
  //       }
  //       if (!body.applicationName || !body.applicationDescription) {
  //         return { message: "Inappropriate Data in the Body", status: 403 };
  //       }
  //       if (
  //         Object.keys(body).every(
  //           (item) =>
  //             item == "applicationName" || item == "applicationDescription"
  //         )
  //       ) {
  //         await Application.update(
  //           {
  //             name: body.applicationName,
  //             description: body.applicationDescription,
  //           },
  //           {
  //             where: {
  //               id: data.appId,
  //             },
  //           }
  //         );
  //       } else {
  //         return { message: "Other Attributes not allowed", status: 403 };
  //       }
  //       console.log("edited Application Info___", applicationEdit, body);
  //       return { message: "Application Edited Successfully", status: 201 };
  //     } else {
  //       return { message: "Application Id not found", status: 403 };
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Application Info:", error);
  //     return { message: "Internal Server Error", status: 500 };
  //   }
  // }

  // static async getTicketStatusInfo(data = {}) {
  //   try {
  //     const page = parseInt(data.page, 10) || 1;
  //     const pageSize = parseInt(data.pagesize, 10) || 10;
  //     const nextPage = data.page < totalPages ? page + 1 : null;
  //     const previousPage = page > 1 ? page - 1 : null;
  //     let result ;
  //     if(data.page && data.pagesize){
  //       result  = await TaskStatusInfo.findAndCountAll({
  //       raw: true,
  //       offset: (page - 1) * pageSize,
  //       limit: pageSize,
  //       order: [['id', 'ASC']], // optional for consistent results
  //     });
  //     }else{
  //          result = await TaskStatusInfo.findAndCountAll({
  //           raw: true,
  //           order: [['id', 'ASC']], // optional for consistent results
  //         });
  //     }
  //     console.log('view_____',result.rows)

  //     if (!result.rows.length) {
  //       return { message: "Ticket Status Info not found", status: 403 };
  //     }

  //     return {
  //       status: 200,
  //       totalRecords: result.count,
  //       totalPages: Math.ceil(result.count / pageSize),
  //       currentPage: page,
  //       rows: result.rows,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching Ticket Status Info:", error);
  //     return { message: "Internal Server Error", status: 500 };
  //   }
  // }
}

module.exports = ApplicationInfoService;
