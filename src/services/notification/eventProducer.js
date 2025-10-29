const { sendNotificationEvent } = require('./notificationProducer');

class EventProducer {

static async registerEmployeeEvent(employeeData) {
  
  // After saving employee, send Kafka event
  await sendNotificationEvent({
    type: 'EMPLOYEE_REGISTERED',
    email: employeeData.email,
    name: employeeData.name,
    subject: 'Welcome to HRMS!',
    message: `Hello ${employeeData.name}, your HRMS account has been created successfully.`,
  });

  return "Notification Send to the employee ";

  };
}

module.exports = EventProducer;