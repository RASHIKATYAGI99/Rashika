const express = require("express")
const { v4: uuidv4 } = require("uuid")
const router = express.Router()

// In-memory storage (replace with database in production)
const users = [
  {
    id: uuidv4(),
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main St, City, State 12345",
    phone: "+1-555-0123",
  },
  {
    id: uuidv4(),
    name: "Jane Smith",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, City, State 67890",
    phone: "+1-555-0456",
  },
]

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", (req, res) => {
  try {
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", code: 500 })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get("/:id", (req, res) => {
  try {
    const user = users.find((u) => u.id === req.params.id)
    if (!user) {
      return res.status(404).json({ error: "User not found", code: 404 })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", code: 500 })
  }
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.post("/", (req, res) => {
  try {
    const { name, email, address, phone } = req.body

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required",
        code: 400,
      })
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
        code: 400,
      })
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      address: address || "",
      phone: phone || "",
    }

    users.push(newUser)
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", code: 500 })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put("/:id", (req, res) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found", code: 404 })
    }

    const updatedUser = { ...users[userIndex], ...req.body, id: req.params.id }
    users[userIndex] = updatedUser

    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", code: 500 })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", (req, res) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.params.id)
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found", code: 404 })
    }

    users.splice(userIndex, 1)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", code: 500 })
  }
})

module.exports = router