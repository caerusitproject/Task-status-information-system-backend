require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const { sequelize } = require('./src/models');

const db = require('./src/models'); // import the file where all associations are defined
const sequelize = db.sequelize;

const auth = require('./src/middlewares/auth');
const errorHandler = require('./src/middlewares/errorHandler');
const authController = require('./src/controllers/authController');
const taskController = require('./src/controllers/taskController');
const adminController = require('./src/controllers/adminController');
const reportController = require('./src/controllers/reportController');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());


// Route Handling
app.use('/api/taskStatusInfo', require('./src/routes/taskStatusInfoRouter'));
app.use('/api/application', require('./src/routes/applicationRouter'));
app.use('/api/ticketingSystem', require('./src/routes/ticketingSystemRouter'));


// app.post('/api/auth/register', authController.register);
// app.post('/api/auth/login', authController.login);

// app.use('/api/tasks', auth.authenticate, taskController.router);
// app.use('/api/admin', auth.authenticate, adminController.router);
// app.get('/api/reports/tasks.xlsx', auth.authenticate, reportController.taskExcel);
// app.get('/api/reports/tasks.pdf', auth.authenticate, reportController.taskPdf);
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
sequelize.authenticate().then(() => sequelize.sync({ alter: false })).then(() => {
  app.listen(PORT, (err) => {
    if (err) {
      console.error('Error starting server:', err);
    } else {
      console.log(`Server running on ${PORT}`);
    }
  });
}).catch(err => {
  console.error('Unable to connect to DB', err);
  process.exit(1);
});
