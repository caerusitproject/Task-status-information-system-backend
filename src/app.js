require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./logger");
// const { sequelize } = require('./src/models');

const db = require("./models"); // import the file where all associations are defined
const sequelize = db.sequelize;
const PORT = process.env.PORT || 5000;

const auth = require("./middlewares/auth");
const errorHandler = require("./middlewares/errorHandler");
const authController = require("./controllers/authController");
const taskController = require("./controllers/taskController");
const adminController = require("./controllers/adminController");
const reportController = require("./controllers/reportController");
const seedColorsOnce = require("./controllers/seedcolorController");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());

// Route Handling
app.use("/api/taskStatusInfo", require("./routes/taskStatusInfoRouter"));
app.use("/api/ticketingSystem", require("./routes/ticketingSystemRouter"));

// IN USE
app.use("/api/application", require("./routes/applicationRouter"));
app.use("/api/report", require("./routes/reportRouter"));
app.use("/api/module", require("./routes/moduleRouter"));
app.use("/api/client", require("./routes/clientRouter"));
app.use("/api/users", require("./routes/usersRouter"));
app.use("/api/timeSheet", require("./routes/timesheetRouter"));

//Report Generate
//Weekly Report Get Call

// app.use("/api/reports/weekly", require("./routes/reportRouter"));
// app.post("/api/reports/pdf", reportController.taskPdf);

//app.use('/api/email/send', emailRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");

    // Sync DB models (dev only). In production use migrations.
    await sequelize.sync({ force: true });
    await seedColorsOnce();
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start app", err);
    process.exit(1);
  }
}

// 🧹 Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("\n🛑 Caught SIGINT, closing database connection...");
  await db.sequelize.close();
  console.log("✅ Database connection closed. Exiting...");
  process.exit(0);
});

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
