const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Application } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class ApplicationInfoService {
  // 🔹 Create Application Status Info
  static async createApplicationInfo(data) {
    const { applicationName, applicationDescription} = data;

    // Validate and create the Application status info
    if(!data.applicationName || data.applicationName == null || data.applicationDescription == null){
      return { message: "Invalid data provided", status: 400 };
    }

    const applicationInfo = await Application.create({
     name:applicationName,
     description:applicationDescription
    });

    return { message: "Application created successfully", status: 200 };
  }

//     return { accessToken, refreshToken };
//   }

  // 🔹 Get Application Status Info

  static async getApplicationInfo(data = {}) {
  try {
    const page = parseInt(data.page, 10) || 1;
    const pageSize = parseInt(data.pagesize, 10) || 10;
    let result;

    if (data.page && data.pagesize) {
      result = await Application.findAndCountAll({
        raw: true,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [["id", "ASC"]],
      });
    } else {
      result = await Application.findAndCountAll({
        raw: true,
        order: [["id", "ASC"]],
      });
    }

    console.log("view_____", result.rows);

    if (!result.rows || !result.rows.length) {
      return { message: "Application not found", status: 403 };
    }

    // Calculate pagination details
    const totalRecords = result.count;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      status: 200,
      totalRecords,
      totalPages,
      currentPage: page,
      nextPage,
      previousPage,
      rows: result.rows,
    };
  } catch (error) {
    console.error("Error fetching Application Info:", error);
    return { message: "Internal Server Error", status: 500 };
  }
}

static async editApplicationInfo(data,body){
    try{
        if(data.appId){
          const applicationEdit = await Application.findOne({ where: { id: data.appId },raw:true });
          if(applicationEdit === null){
             return { message: "Application cannot be Updated!", status: 403 };
          }
          if(!body.applicationName || !body.applicationDescription){
            return { message :'Inappropriate Data in the Body', status: 403}
          }
          if(Object.keys(body).every((item)=> item == 'applicationName' || item == 'applicationDescription')){
              await Application.update({
                name:body.applicationName,
                description:body.applicationDescription,
              },
                {
                    where: {
                        id: data.appId,
                    },
                },
            )
          }else{
             return {  message:'Other Attributes not allowed',status:403}
          }
        console.log('edited Application Info___',applicationEdit,body)
        return {  message:'Application Edited Successfully',status:201}
         
        }else{
            return {message:'Application Id not found',status:403}
        }
    }catch(error){
    console.error("Error fetching Application Info:", error);
    return { message: "Internal Server Error", status: 500 };
    }
}

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
