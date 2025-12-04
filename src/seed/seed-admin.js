require("dotenv").config();
const { sequelize, Users } = require("../models");
const bcrypt = require("bcryptjs");

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();
  const email_id = process.env.SEED_ADMIN_USER || "admin@company.com";
  const password = process.env.SEED_ADMIN_PASS || "Admin@123";
  const salt = parseInt(process.env.BCRYPT_SALT || "10", 10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const [admin, created] = await Users.findOrCreate({
    where: { email_id },
    defaults: {
      email_id,
      password: passwordHash,
      role: "ADMIN",
      is_Active: false,
    },
  });

  console.log("Admin user:", admin.email_id, "created?", created);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
