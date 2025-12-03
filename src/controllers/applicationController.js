const ApplicationInfoService = require("../services/applicationService");

const createApplication = async (req, res) => {
  try {
    const newStatusInfo = await ApplicationInfoService.createApplicationInfo(
      req.body
    );
    res
      .status(newStatusInfo.status)
      .json({ message: newStatusInfo.message, status: newStatusInfo.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewApplication = async (req, res) => {
  try {
    const newStatusInfo = await ApplicationInfoService.getApplicationInfo(
      req.query
    );
    res.status(newStatusInfo.status).json({
      count: newStatusInfo.totalRecords,
      rows: newStatusInfo.rows,
      totalPages: newStatusInfo.totalPages,
      currentPage: newStatusInfo.currentPage,
      nextPage: newStatusInfo.nextPage,
      previousPage: newStatusInfo.previousPage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editApplication = async (req, res) => {
  try {
    const newStatusInfo = await ApplicationInfoService.editApplicationInfo(
      req.params,
      req.body
    );
    res.status(newStatusInfo.status).json({
      message: newStatusInfo.message,
      status: newStatusInfo.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createApplication, viewApplication, editApplication };
