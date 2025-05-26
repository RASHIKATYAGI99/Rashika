const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const { createProxyMiddleware } = require("http-proxy-middleware")
const swaggerUi = require("swagger-ui-express")
const logger = require("../middleware/logger")
const errorHandler = require("../middleware/errorHandler")

const app = express()
const PORT = process.env.GATEWAY_PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(logger)

// Service URLs
const BOOKS_SERVICE_URL = process.env.BOOKS_SERVICE_URL || "http://localhost:3001"
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || "http://localhost:3002"
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || "http://localhost:3003"

// Combined Swagger documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Book Store API Gateway",
    version: "1.0.0",
    description: "Unified API Gateway for Book Store Microservices",
    contact: {
      name: "Book Store API",
      email: "support@bookstore.com",
    },
  },
  servers: [
    {
      url: 'http://localhost:${PORT}',
      description: "API Gateway",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check for all services",
        tags: ["Health"],
        responses: {
          200: {
            description: "Services status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    gateway: { type: "string" },
                    services: {
                      type: "object",
                      properties: {
                        books: { type: "string" },
                        users: { type: "string" },
                        orders: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Book: {
        type: "object",
        required: ["title", "author", "price"],
        properties: {
          id: { type: "string", description: "Unique identifier for the book" },
          title: { type: "string", description: "Title of the book" },
          author: { type: "string", description: "Author of the book" },
          isbn: { type: "string", description: "ISBN number" },
          price: { type: "number", description: "Price of the book" },
          category: { type: "string", description: "Book category" },
          stock: { type: "integer", description: "Available stock" },
        },
      },
      User: {
        type: "object",
        required: ["name", "email"],
        properties: {
          id: { type: "string", description: "Unique identifier for the user" },
          name: { type: "string", description: "User full name" },
          email: { type: "string", format: "email", description: "User email address" },
          address: { type: "string", description: "User address" },
          phone: { type: "string", description: "User phone number" },
        },
      },
      Order: {
        type: "object",
        required: ["userId", "items"],
        properties: {
          id: { type: "string", description: "Unique identifier for the order" },
          userId: { type: "string", description: "ID of the user who placed the order" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                bookId: { type: "string" },
                quantity: { type: "integer" },
                price: { type: "number" },
              },
            },
          },
          totalAmount: { type: "number", description: "Total order amount" },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            description: "Order status",
          },
          createdAt: { type: "string", format: "date-time", description: "Order creation timestamp" },
        },
      },
    },
  },
}

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Health check endpoint
app.get("/health", async (req, res) => {
  const services = {
    books: "unknown",
    users: "unknown",
    orders: "unknown",
  }

  // Check each service
  try {
    const axios = require("axios")

    try {
      await axios.get('${BOOKS_SERVICE_URL}/health', { timeout: 2000 })
      services.books = "healthy"
    } catch (error) {
      services.books = "unhealthy"
    }

    try {
      await axios.get('${USERS_SERVICE_URL}/health', { timeout: 2000 })
      services.users = "healthy"
    } catch (error) {
      services.users = "unhealthy"
    }

    try {
      await axios.get('${ORDERS_SERVICE_URL}/health', { timeout: 2000 })
      services.orders = "healthy"
    } catch (error) {
      services.orders = "unhealthy"
    }
  } catch (error) {
    console.error("Health check error:", error)
  }

  res.json({
    gateway: "healthy",
    timestamp: new Date().toISOString(),
    services,
  })
})

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  logLevel: "warn",
  onError: (err, req, res) => {
    console.error("Proxy error:", err)
    res.status(503).json({
      error: "Service temporarily unavailable",
      code: 503,
    })
  },
}

// Route proxying
app.use(
  "/api/books",
  createProxyMiddleware({
    target: BOOKS_SERVICE_URL,
    ...proxyOptions,
  }),
)

app.use(
  "/api/users",
  createProxyMiddleware({
    target: USERS_SERVICE_URL,
    ...proxyOptions,
  }),
)

app.use(
  "/api/orders",
  createProxyMiddleware({
    target: ORDERS_SERVICE_URL,
    ...proxyOptions,
  }),
)

// Welcome endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Book Store API Gateway",
    version: "1.0.0",
    documentation: 'http://localhost:${PORT}/api-docs',
    services: {
      books: '${BOOKS_SERVICE_URL}/api/books',
      users: '${USERS_SERVICE_URL}/api/users',
      orders: '${ORDERS_SERVICE_URL}/api/orders',
    },
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 })
})

app.listen(PORT, () => {
  console.log('🌐 API Gateway running on port ${PORT}')
  console.log('📖 Swagger docs: http://localhost:${PORT}/api-docs')
  console.log('🏠 Home: http://localhost:${PORT}')
})

module.exports = app