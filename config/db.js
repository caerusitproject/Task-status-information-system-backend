const Sequelize = require("sequelize");
const dbConfig = require("./db.config.js");

var sequelize = new Sequelize(
  dbConfig.development.DB,
  dbConfig.development.USER,
  dbConfig.development.PASSWORD,
  {
    host: dbConfig.development.HOST,
    dialect: dbConfig.development.dialect,
    pool: {
      max: dbConfig.development.pool.max,
      min: dbConfig.development.pool.min,
      acquire: dbConfig.development.pool.acquire,
      idle: dbConfig.development.pool.idle,
    },
  }
);

if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: dbConfig.production.dialect,
    dialectOptions: dbConfig.production.dialectOptions,
  });
}

module.exports = sequelize;
