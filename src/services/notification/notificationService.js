
const EmailTemplate = require("../../models/EmailTemplate");
const Handlebars = require("handlebars");

exports.leaveNotificationConsumer = async (payload) => {
  try {
    // Find email template by event type
    const template = await EmailTemplate.findOne({
      where: { type: payload.type },
    });

    if (!template) {
      console.warn(`⚠️ No email template found for event type: ${payload.type}`);
      return null;
    }

    // Prepare data for Handlebars
    const templateData = {
      name: payload.name,
      empCode: payload.empCode,
      email: payload.email,
      managerName: payload.manager?.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    };

    // Keep only allowed variables
    const filteredData = {};
    if (Array.isArray(template.allowedVariables)) {
      template.allowedVariables.forEach((key) => {
        if (templateData[key] !== undefined) filteredData[key] = templateData[key];
      });
    }

    // Compile subject and body
    const compiledSubject = Handlebars.compile(template.subject)(filteredData);
    const compiledBody = Handlebars.compile(template.body)(filteredData);

    // Choose recipient
    let toEmail = payload.email;
    if (payload.eventType === "leave_applied") {
      toEmail = payload.manager?.email;
    }

    // Return compiled data (no sending here)
    return {
      toEmail,
      subject: compiledSubject,
      body: compiledBody,
    };
  } catch (err) {
    console.error("❌ Error processing leave notification:", err.message);
    throw err;
  }
};