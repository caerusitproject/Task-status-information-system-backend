const { consumer } = require("../config/kafka");
const transporter = require("../../config/mail");
const startLeaveNotificationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "leave-events", fromBeginning: false });
  console.log("✅ Kafka Leave Notification Consumer Started");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📨 Event Received:", event.eventType);

      let mailOptions;

      if (event.eventType === "LEAVE_APPLIED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.manager.email,
          subject: "Leave Application Received",
          html: `
            <h3>Hi ${event.manager.name},</h3>
            <p>${event.employee.name} has applied for leave from <b>${event.startDate}</b> to <b>${event.endDate}</b>.</p>
            <p>Reason: ${event.reason}</p>
          `,
        };
      } else if (event.eventType === "LEAVE_APPROVED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Approved",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>approved</b> by ${event.manager.name}.</p>
          `,
        };
      } else if (event.eventType === "LEAVE_REJECTED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Rejected",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>rejected</b> by ${event.manager.name}.</p>
          `,
        };
      }

      if (mailOptions) {
        try {
          await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent successfully for ${event.eventType}`);
        } catch (err) {
          console.error("❌ Email send failed:", err.message);
        }
      }
    },
  });
}

module.exports = startLeaveNotificationConsumer;