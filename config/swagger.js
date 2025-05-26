const swaggerJsdoc = require("swagger-jsdoc")

const createSwaggerConfig = (title, description, port, version = "1.0.0") => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title,
        version,
        description,
        contact: {
          name: "Book Store API",
          email: "support@bookstore.com",
        },
      },
      servers: [
        {
          url: 'http://localhost:${port}',
          description: "Development server",
        },
      ],
      components: {
        schemas: {
          Book: {
            type: "object",
            required: ["title", "author", "price"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the book",
              },
              title: {
                type: "string",
                description: "Title of the book",
              },
              author: {
                type: "string",
                description: "Author of the book",
              },
              isbn: {
                type: "string",
                description: "ISBN number",
              },
              price: {
                type: "number",
                description: "Price of the book",
              },
              category: {
                type: "string",
                description: "Book category",
              },
              stock: {
                type: "integer",
                description: "Available stock",
              },
            },
          },
          User: {
            type: "object",
            required: ["name", "email"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the user",
              },
              name: {
                type: "string",
                description: "User full name",
              },
              email: {
                type: "string",
                format: "email",
                description: "User email address",
              },
              address: {
                type: "string",
                description: "User address",
              },
              phone: {
                type: "string",
                description: "User phone number",
              },
            },
          },
          Order: {
            type: "object",
            required: ["userId", "items"],
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the order",
              },
              userId: {
                type: "string",
                description: "ID of the user who placed the order",
              },
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
              totalAmount: {
                type: "number",
                description: "Total order amount",
              },
              status: {
                type: "string",
                enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
                description: "Order status",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Order creation timestamp",
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: {
                type: "string",
                description: "Error message",
              },
              code: {
                type: "integer",
                description: "Error code",
              },
            },
          },
        },
      },
    },
    apis: ["./routes/.js", "./services//routes/*.js"],
  }

  return swaggerJsdoc(options)
}

module.exports = { createSwaggerConfig }