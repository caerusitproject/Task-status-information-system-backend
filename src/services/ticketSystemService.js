const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TicketingSystem } = require("../models");
const { raw } = require("body-parser");
const { where } = require("sequelize");
require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecretkey";

class TicketingSystemService {
  // 🔹 Create Application Status Info
  static async createTicketingSystem(data) {
    const { ticketSystemName, ticketSystemDescription} = data;

    // Validate and create the Application status info
    if(!data.ticketSystemName || !data.ticketSystemDescription){
      return { message: "Invalid data provided", status: 400 };
    }
    const ticketingSystemInfo = await TicketingSystem.create({
     ticketing_system_name:ticketSystemName,
     ticketing_system_description:ticketSystemDescription
    });

    return { message: "Ticketing System created successfully", status: 200 };
  }

//     return { accessToken, refreshToken };
//   }

  // 🔹 Get Tickeitng System Info

static async getTicketingSystemInfo(data = {}) {
  try {
    const page = parseInt(data.page, 10) || 1;
    const pageSize = parseInt(data.pagesize, 10) || 10;
    let result;

    if (data.page && data.pagesize) {
      result = await TicketingSystem.findAndCountAll({
        raw: true,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        order: [["id", "ASC"]],
      });
    } else {
      result = await TicketingSystem.findAndCountAll({
        raw: true,
        order: [["id", "ASC"]],
      });
    }

    console.log("view_____", result.rows);

    if (!result.rows || !result.rows.length) {
      return { message: "Ticketing System not found", status: 403 };
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
    console.error("Error fetching Ticketing System Info:", error);
    return { message: "Internal Server Error", status: 500 };
  }
}

static async editTicketingSystemInfo(data,body){
    try{
        if(data.ticketSystemId){
          const ticketSystemEdit = await TicketingSystem.findOne({ where: { id: data.ticketSystemId },raw:true });
          if(ticketSystemEdit === null){
             return { message: "Ticket cannot be Updated!", status: 403 };
          }
          if(!body.ticketSystemName || !body.ticketSystemDescription){
            return { message :'Inappropriate Data in the Body', status: 403}
          }
          if(Object.keys(body).every((item)=> item == 'ticketSystemName' || item == 'ticketSystemDescription')){
              await TicketingSystem.update({
                ticketing_system_name:body.ticketSystemName,
                ticketing_system_description:body.ticketSystemDescription,
              },
                {
                    where: {
                        id: data.ticketSystemId,
                    },
                },
            )
          }else{
             return {  message:'Other Attributes not allowed',status:403}
          }
        console.log('edited Ticket System  Info___',ticketSystemEdit,body)
        return {  message:'Application Edited Successfully',status:201}
         
        }else{
            return {message:'Ticket System  Id not found',status:403}
        }
    }catch(error){
    console.error("Error fetching Ticket System  Info:", error);
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

module.exports = TicketingSystemService;
