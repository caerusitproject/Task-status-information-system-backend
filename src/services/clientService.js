const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Clients } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
const logger = require("../logger");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class ClientInfoService {
  // 🔹 Create Client Status Info
  static async createClientInfo(data) {
    const { name, description } = data;

    // Validate required fields
    if (!name) {
      return { message: "Invalid data provided", status: 400 };
    }

    try {
      // 1️⃣ Create the Client
      const clientInfo = await Clients.create({
        name: name,
        description: description,
      });
      logger.info(`Client created with ID: ${clientInfo.id}`);
      //   // 2️⃣ If module IDs exist, create mapping
      //   if (Array.isArray(modules) && modules.length > 0) {
      //     const moduleData = modules.map((moduleId) => ({
      //       app_id: applicationInfo.id,
      //       module_id: moduleId,
      //     }));

      //     await ApplicationModule.bulkCreate(moduleData);
      //   }

      return {
        message: "Client created successfully",
        status: 200,
      };
    } catch (err) {
      console.error("Error creating clients info:", err);
      logger.error(`Error creating client: ${err.message}`);
      return { message: "Internal server error", status: 500 };
    }
  }

  // 🔹 Get Client Status Info

  static async getClientInfo(data = {}) {
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

      const result = await Clients.findAndCountAll(options);
      logger.info(`Fetched ${result.rows.length} clients from database`);
      // if (!result.rows || result.rows.length === 0) {
      //   return { message: "No clients found", status: 403 };
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
      console.error("Error fetching Client Info:", error);
      logger.error(`Error fetching clients: ${error.message}`);
      return { message: "Internal Server Error", status: 500 };
    }
  }
  static async editClientInfo(data, body) {
    try {
      const { clientId } = data;

      if (!clientId) {
        return { message: "Client ID not found", status: 403 };
      }

      const client = await Clients.findByPk(clientId);

      if (!client) {
        logger.error(`Client with ID: ${clientId} not found`);
        return { message: "Client not found!", status: 404 };
      }

      // Validate body
      const { name, description } = body;

      if (!name) {
        return { message: "Invalid data provided", status: 400 };
      }

      // ---------- UPDATE ONLY BASIC DETAILS ----------
      await Clients.update(
        {
          name: name || "",
          description: description || "",
        },
        { where: { id: clientId } }
      );
      logger.info(`Client with ID: ${clientId} updated successfully`);

      // ---------- UPDATE MODULE MAPPINGS ----------
      //   if (Array.isArray(modules)) {
      //     // fetch module rows
      //     const moduleRows = await Module.findAll({
      //       where: { id: modules },
      //     });

      //     await client.setModule(moduleRows);
      //     // (because alias is `module`)
      //   }

      return { message: "Client updated successfully", status: 200 };
    } catch (error) {
      console.error("Error updating Client:", error);
      logger.error(`Error updating client: ${error.message}`);
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

module.exports = ClientInfoService;
