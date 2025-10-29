const upload = require("../services/uploadService")

exports.uploadFile = async (req, res) => {
  try {
    const { id } = req.params; // employee id
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileRecord = await upload.saveFile({
      employee_id: id,
      file_path: file.path,
      file_type: file.mimetype,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: fileRecord,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await upload.getFilesByEmployee(id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await upload.getFilesByEmployee(id);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const deleted = await upload.deleteFile(fileId);

    if (!deleted) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};