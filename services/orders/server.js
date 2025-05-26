const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const swaggerUi = require("swagger-ui-express")
const { createSwaggerConfig } = require("../../config/swagger")
const logger = require("../../middleware/logger")
const errorHandler = require("../../middleware/errorHandler")
const ordersRoutes = require("./routes/orders")

const app = express()
const PORT = process.env.ORDERS_PORT || 3003

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(logger)

// Swagger documentation
const swaggerSpec = createSwaggerConfig("Orders Service API", "Microservice for managing orders in the bookstore", PORT)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Orders Service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/orders", ordersRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 })
})

app.listen(PORT, () => {
  console.log('📦 Orders Service running on port ${PORT}')
  console.log('📖 Swagger docs: http://localhost:${PORT}/api-docs')
})

module.exports = app