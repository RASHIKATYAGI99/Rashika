const express = require("express")
const { v4: uuidv4 } = require("uuid")
const axios = require("axios")
const router = express.Router()

// In-memory storage (replace with database in production)
const orders = [
  {
    id: uuidv4(),
    userId: "user-1",
    items: [
      { bookId: "book-1", quantity: 2, price: 12.99 },
      { bookId: "book-2", quantity: 1, price: 14.99 },
    ],
    totalAmount: 40.97,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
]

// Service URLs
const BOOKS_SERVICE_URL = process.env.BOOKS_SERVICE_URL || "http://localhost:3001"
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || "http://localhost:3002"

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/", (req, res) => {
  try {
    let filteredOrders = [...orders]

    if (req.query.userId) {
      filteredOrders = filteredOrders.filter((order) => order.userId === req.query.userId)
    }

    if (req.query.status) {
      filteredOrders = filteredOrders.filter((order) => order.status === req.query.status)
    }

    res.json(filteredOrders)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders", code: 500 })
  }
})

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get("/:id", (req, res) => {
  try {
    const order = orders.find((o) => o.id === req.params.id)
    if (!order) {
      return res.status(404).json({ error: "Order not found", code: 404 })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order", code: 500 })
  }
})

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     bookId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const { userId, items } = req.body

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "UserId and items are required",
        code: 400,
      })
    }

    // Verify user exists (optional - comment out if services are not running)
    try {
      await axios.get('${USERS_SERVICE_URL}/api/users/${userId}')
    } catch (error) {
      console.log("Warning: Could not verify user existence")
    }

    // Calculate total amount
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      if (!item.bookId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: "Each item must have bookId and positive quantity",
          code: 400,
        })
      }

      // Get book price (optional - comment out if services are not running)
      let bookPrice = 10.99 // default price
      try {
        const bookResponse = await axios.get('${BOOKS_SERVICE_URL}/api/books/${item.bookId}')
        bookPrice = bookResponse.data.price
      } catch (error) {
        console.log("Warning: Could not fetch book price, using default")
      }

      const itemTotal = bookPrice * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: bookPrice,
      })
    }

    const newOrder = {
      id: uuidv4(),
      userId,
      items: orderItems,
      totalAmount: Number.parseFloat(totalAmount.toFixed(2)),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    orders.push(newOrder)
    res.status(201).json(newOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({ error: "Failed to create order", code: 500 })
  }
})

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Valid status is required",
        code: 400,
      })
    }

    const orderIndex = orders.findIndex((o) => o.id === req.params.id)
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found", code: 404 })
    }

    orders[orderIndex].status = status
    res.json(orders[orderIndex])
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status", code: 500 })
  }
})

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       404:
 *         description: Order not found
 */
router.delete("/:id", (req, res) => {
  try {
    const orderIndex = orders.findIndex((o) => o.id === req.params.id)
    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found", code: 404 })
    }

    orders[orderIndex].status = "cancelled"
    res.json({ message: "Order cancelled successfully", order: orders[orderIndex] })
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel order", code: 500 })
  }
})

module.exports = router