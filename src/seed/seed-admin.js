require('dotenv').config();
const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();
  const username = process.env.SEED_ADMIN_USER || 'admin';
  const password = process.env.SEED_ADMIN_PASS || 'Admin@123';
  const salt = parseInt(process.env.BCRYPT_SALT || '10', 10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const [admin, created] = await User.findOrCreate({
    where: { username },
    defaults: { username, passwordHash, role: 'ADMIN', fullName: 'Administrator' }
  });

  console.log('Admin user:', admin.username, 'created?', created);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
