const UserInfoService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const newStatusInfo = await UserInfoService.registerUsers(req.body);
    res.status(newStatusInfo.status).json({
      token: newStatusInfo.token,
      message: newStatusInfo.message,
      status: newStatusInfo.status,
      user: newStatusInfo.user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const viewUser = async (req, res) => {
//   try {
//     const newStatusInfo = await ClientInfoService.getClientInfo(req.query);
//     res.status(newStatusInfo.status).json({
//       count: newStatusInfo.totalRecords,
//       rows: newStatusInfo.rows,
//       totalPages: newStatusInfo.totalPages,
//       currentPage: newStatusInfo.currentPage,
//       nextPage: newStatusInfo.nextPage,
//       previousPage: newStatusInfo.previousPage,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const editUser = async (req, res) => {
//   try {
//     const newStatusInfo = await ClientInfoService.editClientInfo(
//       req.params,
//       req.body
//     );
//     res.status(newStatusInfo.status).json({
//       message: newStatusInfo.message,
//       status: newStatusInfo.status,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

module.exports = { createUser };
