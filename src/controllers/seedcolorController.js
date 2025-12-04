const Colors = require("../models/colors"); // adjust path
require("dotenv").config();
const { sequelize, User } = require("../models");
const bcrypt = require("bcryptjs");

async function seedColorsOnce() {
  const existingCount = await Colors.count();

  if (existingCount === 0) {
    const colorCodes = [
      "#fcde72",
      "#ff9c68",
      "#7fc0ff",
      "#ffcccc",
      "#fcd05b",
      "#e0caebff",
      "#ffb07a",
      "#99ffe0",
      "#f3d27fff",
      "#ff7f7f",
      "#b3d6ff",
      "#e1b5fdbb",
      "#faca34",
      "#ffb988",
      "#ccfff7",
      "#ff9999",
      "#cce6ff",
      "#ffb3b3",
      "#7fffd4",
      "#ffc199",
      "#d7aefc",
      "#99ccff",
      "#ffffff56",
    ];

    await Colors.bulkCreate(colorCodes.map((code) => ({ code })));
    console.log("🎨 Color table seeded successfully!");
  } else {
    console.log("✅ Colors already exist — skipping seeding.");
  }
}

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();
  const username = process.env.SEED_ADMIN_USER || "admin";
  const password = process.env.SEED_ADMIN_PASS || "Admin@123";
  const salt = parseInt(process.env.BCRYPT_SALT || "10", 10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const [admin, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      username,
      passwordHash,
      role: "ADMIN",
      fullName: "Administrator",
    },
  });

  console.log("Admin user:", admin.username, "created?", created);
  process.exit(0);
}

module.exports = { seedColorsOnce, run };
