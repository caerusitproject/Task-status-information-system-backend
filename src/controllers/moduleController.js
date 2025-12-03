const ModuleInfoService = require("../services/moduleService");

const createModule = async (req, res) => {
  try {
    const newStatusInfo = await ModuleInfoService.createModuleInfo(req.body);
    res
      .status(newStatusInfo.status)
      .json({ message: newStatusInfo.message, status: newStatusInfo.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewModule = async (req, res) => {
  try {
    const newStatusInfo = await ModuleInfoService.getModuleInfo(req.query);
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

const editModule = async (req, res) => {
  try {
    const newStatusInfo = await ModuleInfoService.editModuleInfo(
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

module.exports = { createModule, viewModule, editModule };
