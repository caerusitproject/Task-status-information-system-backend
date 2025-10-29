const EmailTemplate = require('../../models/EmailTemplate');

class emailTemplateService {
  async createTemplate(data) {
    if (data.allowedVariables && !Array.isArray(data.allowedVariables)) {
      throw new Error('allowedVariables must be an array');
    }

    return await EmailTemplate.create({
      type: data.type,
      subject: data.subject,
      body: data.body,
      allowedVariables: data.allowedVariables || []
    });
  }

  async updateTemplate(id, updateData) {
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.update(updateData);
  }
  async getTemplateByType(type) {
    const template = await EmailTemplate.findOne({ where: { type }, attributes: ['id', 'type', 'subject', 'body', 'allowedVariables'] });
    return template;
  };

  async getAllTemplateTypes({ page = 1, limit = 10 }){
    const offset = (page - 1) * limit;
    return await EmailTemplate.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'type','allowedVariables']
    });
  };

  
  async getAllTemplate(){
    return await EmailTemplate.findAndCountAll({
      attributes: ['id', 'type','allowedVariables','subject','body']
    });
  };
  async deleteTemplate(id) {
    const template = await EmailTemplate.findByPk(id);
    if (!template) throw new Error('Template not found');
    return await template.destroy();
  }
}

module.exports = new emailTemplateService();
