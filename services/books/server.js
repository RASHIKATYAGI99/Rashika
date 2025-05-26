const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const swaggerUi = require("swagger-ui-express")
const { createSwaggerConfig } = require("../../config/swagger")
const logger = require("../../middleware/logger")
const errorHandler = require("../../middleware/errorHandler")
const booksRoutes = require("./routes/books")

const app = express()
const PORT = process.env.BOOKS_PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(logger)

// Swagger documentation
const swaggerSpec = createSwaggerConfig("Books Service API", "Microservice for managing books in the bookstore", PORT)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "Books Service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/books", booksRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 })
})

app.listen(PORT, () => {
  console.log('📚 Books Service running on port ${PORT}')
  console.log('📖 Swagger docs: http://localhost:${PORT}/api-docs')
})

module.exports = app