const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Application, ApplicationModule, Module } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class ModuleInfoService {
  // 🔹 Create Application Status Info
  static async createModuleInfo(data) {
    const { moduleName, moduleDescription, appid } = data;

    // Validate required fields
    if (!moduleName) {
      return { message: "Invalid data provided", status: 400 };
    }

    try {
      // 1️⃣ Create the Application
      const moduleInfo = await Module.create({
        name: moduleName,
        description: moduleDescription,
        app_id: appid,
      });

      return {
        message: "Module created successfully",
        status: 200,
        moduleId: moduleInfo.id,
      };
    } catch (err) {
      console.error("Error creating application info:", err);
      return { message: "Internal server error", status: 500 };
    }
  }

  //     return { accessToken, refreshToken };
  //   }

  // 🔹 Get Application Status Info

  static async getModuleInfo(data = {}) {
    try {
      const page = data.page ? parseInt(data.page, 10) : null;
      const pageSize = data.pagesize ? parseInt(data.pagesize, 10) : null;

      const options = {
        order: [["id", "ASC"]],
      };

      // Apply pagination only if both are provided
      if (page && pageSize) {
        options.limit = pageSize;
        options.offset = (page - 1) * pageSize;
      }

      const result = await Module.findAndCountAll(options);

      //   if (!result.rows || result.rows.length === 0) {
      //     return { message: "No Modules found", status: 403 };
      //   }

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
      console.error("Error fetching Modules Info:", error);
      return { message: "Internal Server Error", status: 500 };
    }
  }

  static async editModuleInfo(data, body) {
    try {
      const { moduleId } = data;

      if (!moduleId) {
        return { message: "Module ID not found", status: 403 };
      }

      const module = await Module.findByPk(moduleId);

      if (!module) {
        return { message: "Module not found!", status: 404 };
      }

      // Validate body
      const { moduleName, moduleDescription, appid } = body;

      if (!moduleName) {
        return { message: "Invalid data provided", status: 400 };
      }

      // ---------- UPDATE ONLY BASIC DETAILS ----------
      await Module.update(
        {
          name: moduleName || "",
          description: moduleDescription || "",
          app_id: appid || null,
        },
        { where: { id: moduleId } }
      );

      return { message: "Modules updated successfully", status: 200 };
    } catch (error) {
      console.error("Error updating Modules:", error);
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

module.exports = ModuleInfoService;
