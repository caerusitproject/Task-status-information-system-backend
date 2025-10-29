const db = require("../models");
const Upload = db.Upload;

class UploadService {
  /**
   * Save uploaded file metadata in DB
   * @param {Object} payload - employee_id, file_path, file_type
   * @returns {Promise<Object>}
   */
  static async saveFile(payload) {
    return await Upload.create({
      employee_id: payload.employee_id,
      file_path: payload.file_path,
      file_type: payload.file_type,
    });
  }

  /**
   * Get all files for an employee
   * @param {Number} employee_id
   * @returns {Promise<Array>}
   */
  static async getFilesByEmployee(employee_id) {
    return await Upload.findAll({
      where: { employee_id },
      order: [["uploaded_at", "DESC"]],
    });
  }

  /**
   * Delete a file by ID
   * @param {Number} id
   * @returns {Promise<Boolean>}
   */
  static async deleteFile(id) {
    const deleted = await Upload.destroy({ where: { id } });
    return deleted > 0;
  }
}

module.exports = UploadService;