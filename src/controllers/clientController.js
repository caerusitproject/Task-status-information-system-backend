const ClientInfoService = require("../services/clientService");

const createClient = async (req, res) => {
  try {
    const newStatusInfo = await ClientInfoService.createClientInfo(req.body);
    res
      .status(newStatusInfo.status)
      .json({ message: newStatusInfo.message, status: newStatusInfo.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewClient = async (req, res) => {
  try {
    const newStatusInfo = await ClientInfoService.getClientInfo(req.query);
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

const editClient = async (req, res) => {
  try {
    const newStatusInfo = await ClientInfoService.editClientInfo(
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

module.exports = { createClient, viewClient, editClient };
