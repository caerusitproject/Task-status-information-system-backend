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

const loginUser = async (req, res) => {
  try {
    const newStatusInfo = await UserInfoService.loginUsers(req.body);
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

module.exports = { createUser, loginUser };
