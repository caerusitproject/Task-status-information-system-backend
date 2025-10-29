require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
//const employeeRoutes = require("./routes/employeeRoutes");

const setupSwagger = require("./swagger");

//const payrollRoutes = require('./routes/payroll/payrollRoutes');
const app = express();
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000;

app.use(express.json());



// Swagger
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/api', routes);


//app.use('/api/email/send', emailRoutes);






async function start() {
  try {
    await sequelize.authenticate();
    console.log('Postgres connected');

    // Sync DB models (dev only). In production use migrations.
    /*await sequelize.sync({ alter: true });*/
    console.log('Database synchronized');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
}

// 🧹 Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Caught SIGINT, closing database connection...');
  await db.sequelize.close();
  console.log('✅ Database connection closed. Exiting...');
  process.exit(0);
});



start().catch(err => { console.error(err); process.exit(1); });
