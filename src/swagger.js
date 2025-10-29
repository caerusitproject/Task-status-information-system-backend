const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Basic Swagger definition
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS API Documentation",
      version: "1.0.0",
      description: "This is the API documentation for the HRMS application",
    },
    servers: [
      {
        url: "http://localhost:3000", // change to your server URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API route files
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
