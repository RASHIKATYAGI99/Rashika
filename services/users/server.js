const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const swaggerUi = require("swagger-ui-express")
const { createSwaggerConfig } = require("../../config/swagger")
const logger = require("../../middleware/logger")
const errorHandler = require("../../middleware/errorHandler")
const usersRoutes = require("./routes/users")

const app = express()
const PORT = process.env.USERS_PORT || 3002

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(logger)

// Swagger documentation
const swaggerSpec = createSwaggerConfig("Users Service API", "Microservice for managing users in the bookstore", PORT)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Users Service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/users", usersRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 })
})

app.listen(PORT, () => {
  console.log('👥 Users Service running on port ${PORT}')
  console.log('📖 Swagger docs: http://localhost:${PORT}/api-docs')
})

module.exports = app